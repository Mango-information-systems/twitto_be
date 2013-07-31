// daily update of users klout scores
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
 * statistics calculation functions
----------------------------------------------------------------------------------- */

function storeResult(score) {
// store result in database

	var qry = mysql.query('INSERT INTO tw_user (tw_id, klout_score, last_update_klout) VALUES ' + mysql.escape(score) + ' ON DUPLICATE KEY UPDATE klout_score=VALUES(klout_score), last_update_klout = VALUES(last_update_klout)', function(err, data) {
		if (err) {
			console.log('error storing results for ', data)
			throw err
		}
		else {
			console.log('results saved , affected rows:', data.affectedRows)
			// console.log(data)
		}
	})
	/*
	console.log('-------------------------------------------------------------------')
 	console.log('rendered query', qry.sql)
	console.log('-------------------------------------------------------------------')
	*/
}

function getKloutScores(currentIndex, errCount, ids) {
// get twitter Ids of a given community

	if (currentIndex < ids.length) {
		console.log('-------------------------------------------------------------------')
		console.log('requesting klout score... ')
		klout.getUserScore(ids[currentIndex].klout_id, function(err, klout_response) {
//console.log(ids[currentIndex].klout_id)
			if (err || klout_response.validationErrors) {
				if (err == 'Error: Klout is unavailable.')	{
				// Klout not reachable, retry after a short delay
					console.log('Klout is unavailable, reattempting...')
					if (errCount < 3)
						// retry with linear backoff
						_.delay(getKloutScores, 15000 * (1 + 2 * errCount), currentIndex, errCount+1, ids)
					else {
						console.log('failed too many times, exiting.')
						shutdownProcess()
					}
				}
				else if (klout_response && klout_response.validationErrors) {
					console.log('Id validation error, skipping...')
					getKloutScores (currentIndex+1, 0, ids)
				}
				else if (klout_response && klout_response.headers && klout_response.headers['x-mashery-error-code'] == 'ERR_403_DEVELOPER_OVER_RATE') {
				// rate-limited, retry after delay expiration
					console.log('Rate-limited, waiting for', (parseInt(klout_response.headers['retry-after'])/3600).toFixed(2), ' hours')
					_.delay(getKloutScores, parseInt(klout_response.headers['retry-after'])*1000, currentIndex, errCount+1, ids)
				}
				else if (err.code == 'ECONNRESET' || err.code == 'EADDRINFO') {
				// connection error, retry after a short delay
					console.log('Connection problem, reattempting...')
					if (errCount < 3)
						_.delay(getKloutScores, 5000, currentIndex, errCount+1, ids)
					else {
						console.log('failed too many times, exiting.')
						shutdownProcess()
					}
				}
				else {
				// other error, log and exit
					console.log('getUserScore error ', err, klout_response)
					if (errCount < 3)
						_.delay(getKloutScores, 5000, currentIndex, errCount+1, ids)
					else {
						console.log('failed too many times, exiting.')
						shutdownProcess()
					}
				}
	 /*
	// blacklist unmatched ids, so that we don't re-process them at next iteration
	// problematic because sometimes Kred returns the record, but filling id inside 'name' property
	blacklist = blacklist.concat(_.difference(ids, _.pluck(body.data, 'numeric_id')))
	*/
			}
			else {
				console.log('... klout response received')
				storeResult([[ids[currentIndex].tw_id, klout_response.score, processTimestamp]])
				if (currentIndex >= ids.length-1) {
					getUserIds()
				}
				else {
					_.delay(getKloutScores, 50, currentIndex+1, 0, ids)
				}
			}
		})
	}
}

function getUserIds() {
// get user ids withklout scores not updated recently
	console.log('------------------- looking up users in tw_user')
	mysql.query('select tw_id, klout_id from tw_user where klout_id is not null and last_update_klout < CURDATE() - INTERVAL 1 DAY order by last_update_klout limit 5000', function(err, res) {
		/* and klout_id not in (' + mysql.escape(blacklist) + ')  */
		if (err) throw err
		else {
			if (res.length == 0) {
				console.log('processing finished successfully')
				shutdownProcess()
			}
			else {
// console.log(res.length, 'results, first one: ', res[0].id)
				_.delay(getKloutScores, 50, 0, 0, res)
			}
		}
	})	
}

getUserIds()



