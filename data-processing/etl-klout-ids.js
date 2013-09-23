// extraction of klout ids for users to yet looked up
var Mysql = require('mysql')
	, _ = require('underscore')
	, Klout = require("node_klout")
	, params = require('./params.json')
    , klout = new Klout(params.klout.key, "json", "v2")
    , processTimestamp = timeStampToMysqlFormat(new Date())
	, blacklist = [0] // temp workaround for not found users. soft delete to be implemented instead

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

function storeResult(identity) {
// store result in database
//	console.log(result)

	var qry = mysql.query('INSERT INTO tw_user (tw_id, klout_id, last_update_klout) VALUES ' + mysql.escape(identity) + ' ON DUPLICATE KEY UPDATE klout_id = VALUES(klout_id), last_update_klout = VALUES(last_update_klout)', function(err, data) {
		if (err) {
			console.log('error storing klout identity', data)
			throw err
		}
		else {
			console.log('klout identity saved , affected rows:', data.affectedRows)
		}
	})
	if (identity[0][1]) {

	// insert user to topics fact table, assigning to the dummy topic. This record will trigger topics load at next topics ETL execution
		var topicRow = [[identity[0][0], -1, '1900-1-1 00:00:00']]
		var qry2 = mysql.query('INSERT ignore INTO fact_topic (tw_id, topic_id, last_update) VALUES ' + mysql.escape(topicRow), function(err, data) {
			if (err) {
				console.log('error storing topics dummy record', data)
				throw err
			}
			else {
				console.log('dummy topics record saved , affected rows:', data.affectedRows)
			}
		})
		/*
		console.log('-------------------------------------------------------------------')
		console.log('rendered query', qry2.sql)
		console.log('-------------------------------------------------------------------')
		*/
	}
	/*
	console.log('-------------------------------------------------------------------')
 	console.log('rendered query', qry.sql)
	console.log('-------------------------------------------------------------------')
	*/
}

function getKloutIds(currentIndex, errCount, ids) {
// get twitter Ids of a given community

	if (currentIndex < ids.length) {
		console.log('-------------------------------------------------------------------')
		console.log('requesting klout id... ')
		klout.getKloutIdentity(ids[currentIndex], function(err, klout_response) {
			if (err) {
				if (err == 'Error: Resource or user not found.') {
				// user not found, skip
					console.log('skipping user not found')
					storeResult([[ids[currentIndex], null, processTimestamp]])
					if (currentIndex >= ids.length-1) {
						getUserIds()
					}
					else {
						_.delay(getKloutIds, 50, currentIndex+1, 0, ids)
					}
				}
				else if (err == 'Error: Klout is unavailable.' || err == 'SyntaxError: Unexpected end of input')	{
				// Klout not reachable, retry after a short delay
					console.log('Klout is unavailable, reattempting...')
					if (errCount < 3)
						// retry with linear backoff
						_.delay(getKloutIds, 15000 * (1 + 2 * errCount), currentIndex, errCount+1, ids)
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
				else if (klout_response && klout_response.headers['x-mashery-error-code'] == 'ERR_403_DEVELOPER_OVER_RATE') {
				// rate-limited, retry after delay expiration
					console.log('Rate-limited, waiting for', (parseInt(klout_response.headers['retry-after'])/3600).toFixed(2), ' hours')
					_.delay(getKloutIds, parseInt(klout_response.headers['retry-after'])*1000, currentIndex, errCount+1, ids)
				}
				else if (err.code == 'ECONNRESET' || err.code == 'EADDRINFO') {
				// connection error, retry after a short delay
					console.log('Connection problem, reattempting...')
					if (errCount < 3)
						_.delay(getKloutIds, 5000, currentIndex, errCount+1, ids)
					else {
						console.log('failed too many times, exiting.')
						shutdownProcess()
					}
				}
				else {
				// other error, log and exit
					console.log('getKloutIdentity error ', err, klout_response)
					if (errCount < 3)
						_.delay(getKloutIds, 5000, currentIndex, errCount+1, ids)
					else {
						console.log('failed too many times, exiting.')
						shutdownProcess()
					}
				}
	 /*
	// blacklist unmatched ids, so that we don't re-process them at next iteration
	// problematic because sometimes Kred returns the record, but filling id inside 'name' property
	blacklist = blacklist.concat(_.difference(ids, _.pluck(body.data, 'numeric_id')))
	storeResult(body.data)
	if (currentIndex+kloutMaxTermsCount >= ids.length) {
		getUserIds()
	}
	else {
		getKloutIds(currentIndex+kloutMaxTermsCount, ids)
	}
	*/
			}
			else {
				console.log('... klout response received')
				// console.log(klout_response)
				storeResult([[ids[currentIndex], klout_response.id, processTimestamp]])
				if (currentIndex >= ids.length-1) {
					 getUserIds()
				 }
				else {
					_.delay(getKloutIds, 50, currentIndex+1, 0, ids)
				}
			}
		})
	}
}

function getUserIds() {
// get user ids missing klout information
	console.log('------------------- looking up users in tw_user')
	mysql.query('select tw_id from tw_user where klout_id is null order by last_update_klout limit 5000', function(err, res) {
		if (err) throw err
		else {
			if (res.length == 0) {
				console.log('processing finished successfully')
				shutdownProcess()
			}
			else {
// console.log(res.length, 'results, first one: ', res[0].id)
				var userIds = _.pluck(res, 'tw_id')
				_.delay(getKloutIds, 50, 0, 0, userIds)
			}
		}
	})	
}

getUserIds()



