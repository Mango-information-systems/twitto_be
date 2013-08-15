// daily update of users klout scores
var Mysql = require('mysql')
	, _ = require('underscore')
	, Klout = require("node_klout")
	, params = require('./params.json')
    , klout = new Klout(params.klout.key, "json", "v2")
    , processTimestamp = timeStampToMysqlFormat(new Date())
	, kloutTopicsCache = []
	, facts = [] // raw facts received from klout

console.log('-- Using environment settings: ' + params.profile_name)

/* -----------------------------------------------------------------------------------
 * misc. process and database functions
----------------------------------------------------------------------------------- */

// listen to SIGINT signal to shutdown cleanly
process.on( 'SIGINT', function() {
	console.log( "\ngracefully shutting down from  SIGINT (Crtl-C)" )
	shutdownProcess()
})

function shutdownProcess() {
// use process.nextTick to exit the process without interrupting an atomic operation (=storing/indexing or deleting/deindexing tweet )
	process.nextTick(function() {
		process.exit()
	})
}

mysqlConfig = {
	host       : params.db.db_host
	, database : params.db.db_name
	, user     : params.db.db_user
	, password : params.db.db_pass
}

// initialize mysql connection
var mysql = Mysql.createConnection(mysqlConfig)

mysql.connect()

function handleMysqlDisconnect(connection) {
	mysql.on('error', function(err) {
		if (!err.fatal) {
			return
		}

		if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
			throw err
		}

		console.log('Re-connecting lost connection: ' + err.stack)

		mysql = Mysql.createConnection(mysqlConfig)
		handleMysqlDisconnect(mysql)
		mysql.connect()
	})
  
}

handleMysqlDisconnect(mysql)

// formatting mySQL timestamps
// taken from http://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString()
    if(-10 < d && d < 0) return "-0" + (-1*d).toString()
    return d.toString()
}
function timeStampToMysqlFormat(date1) {
    return date1.getUTCFullYear() + "-" + twoDigits(1 + date1.getUTCMonth()) + "-" + twoDigits(date1.getUTCDate()) + " " + twoDigits(date1.getUTCHours()) + ":" + twoDigits(date1.getUTCMinutes()) + ":" + twoDigits(date1.getUTCSeconds())
}

/* -----------------------------------------------------------------------------------
 * module functions
----------------------------------------------------------------------------------- */

function deleteKloutId (tw_id) {
// remove obsolete klout_id	
// console.log('deleting obsolere Klout info for user', tw_id)
	var qry = mysql.query('update tw_user set klout_id = null, klout_score = null where tw_id = ' + tw_id, function(err, data) {
		if (err) {
			console.log('error removing obsolete tw_id from tw_user', data)
			throw err
		}
	})
	
	var qry2 = mysql.query('delete from fact_topic where tw_id = ' + tw_id, function(err, data) {
		if (err) {
			console.log('error deleting facts to obsolete tw_id', data)
			throw err
		}
	})
}

function storeFacts () {
// load steps for the fact table, looks up topic_ids from the dimension

	var qry = mysql.query('select topic_id, klout_topic_id from dim_topic', function(err, data) {
		if (err) {
			console.log('error looking up updated topics dimension ', data)
			throw err
		}
		else {
			var topicIdsMap = {}
			
			_.each(data, function(item) {
				// memorize topic_id matching with each klout_topic_id
				topicIdsMap[item.klout_topic_id] = item.topic_id
			})
			
			// format facts for insertion (flattenize klout topics array and lookup internal topic_id)
			var insertFacts = []
			
			_.each(facts, function(row) {
				var formattedFact = _.map(row.topics, function(item) {
					return [row.tw_id, topicIdsMap[item], processTimestamp]
				})

				if (formattedFact.length < 1) {
					formattedFact = [[row.tw_id, -1, processTimestamp]]
					row.topics = [-1]
				}
				insertFacts = insertFacts.concat(formattedFact)
			})
			
			var qry = mysql.query('REPLACE INTO fact_topic (tw_id, topic_id, last_update) VALUES ' + mysql.escape(insertFacts), function(err, data) {
				if (err) {
					console.log('error storing fact record', data)
					throw err
				}
				else {
					console.log('new topics facts saved, affected rows:', data.affectedRows)
				}
			})
			/*
			console.log('-------------------------------------------------------------------')
			console.log('rendered facts update query', qry.sql)
			console.log('-------------------------------------------------------------------')
			*/
			_.each(facts, function(fact) {
				var topicsIds = _.map(fact.topics, function(topic) {
					// console.log(topic, topicIdsMap[topic])
					return topicIdsMap[topic] || -1;
				})
				
				var qry = mysql.query('DELETE FROM fact_topic where tw_id = ' + fact.tw_id + ' and topic_id not in (' + mysql.escape(topicsIds) + ')', function(err, data) {
					if (err) {
						console.log('error deleting obsolete topic facts results for ', data)
						throw err
					}
					else {
						// console.log('obsolete topics facts removed , affected rows:', data.affectedRows)
						// console.log(data)
					}
				})
				/*
				console.log('-------------------------------------------------------------------')
				console.log('rendered facts delete query', qry.sql)
				console.log('-------------------------------------------------------------------')
				*/
			})
			
			// re-run the userIds extraction from database
			_.delay(getUserIds, 1000)
			
		}
	})
}

function storeDimensions(topics) {
// store result in database
	
	var newDims = []

	// identify the topics which are not yet known
	_.each(topics, function(topic) {
		if (kloutTopicsCache.indexOf(topic.id) == -1) {
			newDims.push([topic.id, topic.topicType, topic.slug, topic.displayName, topic.imageUrl])
		}
	})
	
	// store the new topics in dim_topic in case there are som
	if (newDims.length > 0) {
		var qry = mysql.query('INSERT IGNORE INTO dim_topic (klout_topic_id, topic_type, slug, display_name, image_url) VALUES ' + mysql.escape(newDims), function(err, data) {
			if (err) {
				console.log('error storing topic dimension for ', data)
				throw err
			}
			else {
				//console.log('new topics dim saved , affected rows:', data.affectedRows)
				kloutTopicsCache = kloutTopicsCache.concat(_.pluck(topics, 'id'))
			}
		})
		/*
		console.log('-------------------------------------------------------------------')
		console.log('rendered query', qry.sql)
		console.log('-------------------------------------------------------------------')
		*/
	}
	
}

function getKloutTopics(currentIndex, errCount, ids) {
// get twitter Ids of a given community

	if (currentIndex < ids.length) {
		if (currentIndex % 100 == 0)
			console.log('extracting klout topics facts...')
		// console.log('-------------------------------------------------------------------')
		// console.log('requesting klout topic... ')
		klout.getUserTopics(ids[currentIndex].klout_id, function(err, klout_response) {
// console.log(ids[currentIndex].tw_id, err, klout_response)
			if (err || klout_response.validationErrors) {
				if (err == 'Error: Klout is unavailable.' || err == 'SyntaxError: Unexpected end of input')	{
				// Klout not reachable, retry after a short delay
					console.log('Klout is unavailable, reattempting...')
					if (errCount < 3) {
						// retry with linear backoff
						_.delay(getKloutTopics, 15000 * (1 + 2 * errCount), currentIndex, errCount+1, ids)
					}
					else {
						console.log('failed too many times, exiting.')
						shutdownProcess()
					}
				}
				else if (klout_response && klout_response.headers && klout_response.headers['x-mashery-error-code'] == 'ERR_403_DEVELOPER_OVER_QPS') {
					console.log('----------------------------')
					console.log('Klout complains about too many requests per second, consider increasing delay')
					// we do not relaunch in order to avoid being banned/blacklisted
					// process should rather be debugged when this happens
					shutdownProcess()
				}
				else if (klout_response && klout_response.validationErrors) {
					console.log('Id validation error, skipping...')
					deleteKloutId(ids[currentIndex].tw_id)
					getKloutTopics (currentIndex+1, 0, ids)
				}
				else if (klout_response && klout_response.headers && klout_response.headers['x-mashery-error-code'] == 'ERR_403_DEVELOPER_OVER_RATE') {
				// rate-limited, retry after delay expiration
					console.log('Rate-limited, waiting for', (parseInt(klout_response.headers['retry-after'])/3600).toFixed(2), ' hours')
					_.delay(getKloutTopics, parseInt(klout_response.headers['retry-after'])*1000, currentIndex, errCount+1, ids)
				}
				else if (err.code == 'ECONNRESET' || err.code == 'EADDRINFO') {
				// connection error, retry after a short delay
					console.log('Connection problem, reattempting...')
					if (errCount < 3)
						_.delay(getKloutTopics, 5000, currentIndex, errCount+1, ids)
					else {
						console.log('failed too many times, exiting.')
						shutdownProcess()
					}
				}
				else {
				// other error, log and exit
					console.log('getKloutTopics error ', err, klout_response)
					if (errCount < 3)
						_.delay(getKloutTopics, 5000, currentIndex, errCount+1, ids)
					else {
						console.log('failed too many times, exiting.')
						shutdownProcess()
					}
				}
			}
			else {
				// console.log('... klout response received')
				//console.log('klout_response', klout_response)
				// store result in variable, 
				facts.push({tw_id:ids[currentIndex].tw_id, topics: _.pluck(klout_response, 'id')})
				storeDimensions(klout_response)
				if (currentIndex >= ids.length-1) {
					// last record of the 500 batch, store facts (we assume dimension record will be stored before the fact, so that we can get the matching ID)
					_.delay(storeFacts, 100)
				}
				else {
					//process next record after a short delay
					_.delay(getKloutTopics, 50, currentIndex+1, 0, ids)
				}
			}
		})
	}
}

function getUserIds() {
// get user ids withklout scores not updated recently
	console.log('------------------- looking up users in tw_user')
	mysql.query('select f.tw_id, klout_id from fact_topic f, tw_user t where f.tw_id = t.tw_id and klout_id is not null and f.last_update < CURDATE() - INTERVAL 1 DAY order by f.last_update limit 1000', function(err, res) {
		if (err) throw err
		else {
			if (res.length == 0) {
				console.log('processing finished successfully')
				shutdownProcess()
			}
			else {
				// reset facts variable cache
				facts = []
				_.delay(getKloutTopics, 50, 0, 0, res)
			}
		}
	})	
}

function cacheKnownTopics() {
// cache klout topics already present in the database

	var qry = mysql.query('select klout_topic_id from dim_topic', function(err, data) {
		if (err) {
			console.log('error caching Klout topics', data)
			throw err
		}
		else {
			topicsCache = _.pluck(data, 'klout_topic_id')
			getUserIds()
		}
	})
}

cacheKnownTopics()
