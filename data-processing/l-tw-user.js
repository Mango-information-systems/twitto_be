// load tw_user based on refreshed staging content
var Mysql = require('mysql')
	, params = require('./params.json')
	, processDate = new Date()

console.log('-- Using environment settings: ' + params.profile_name)

/* -----------------------------------------------------------------------------------
 * misc. process and database functions (i.e. generic content you can skip)
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

function loadUsers() {
// update production table
// uses etl audit table to select only records updated since last successful etl run

	var qry = mysql.query('INSERT INTO tw_user (tw_id, screen_name, name, description, profile_image_url, lang) SELECT id, screen_name, name, description, profile_image_url, lang from stg_tw_user WHERE deleted = 0 and last_update > (SELECT last_run from audit_etl where process_name = "load_tw_user") ON DUPLICATE KEY UPDATE screen_name = VALUES(screen_name), name = VALUES(name), description = VALUES(description), profile_image_url = VALUES(profile_image_url), lang = VALUES(lang)', function(err, data) {
		if (err) {
			console.log('error updating users', data)
			throw err
		}
		else {
			console.log('rows updated , affected rows:', data.affectedRows)
			// remove users deleted from twitter
			var qry = mysql.query('DELETE FROM tw_user where tw_id in (SELECT id from stg_tw_user WHERE deleted = 1 and last_update > (SELECT last_run from audit_etl where process_name = "load_tw_user"))', function(err, data) {
				if (err) {
					console.log('error removing users', data)
					throw err
				}
				else {
					console.log('deleted users, affected rows:', data.affectedRows)
					// cleanup fact topics
					var qry = mysql.query('DELETE FROM fact_topic where tw_id in (SELECT id from stg_tw_user WHERE deleted = 1 and last_update > (SELECT last_run from audit_etl where process_name = "load_tw_user"))', function(err, data) {
						if (err) {
							console.log('error deleting old users from fact_topic', data)
							throw err
						}
						else {
							console.log('cleaned up topics, affected rows:', data.affectedRows)
							// update audit date
							mysql.query('UPDATE audit_etl SET last_run = "' + timeStampToMysqlFormat(processDate) + '" WHERE process_name = "load_tw_user"', function(err, data) {
								if (err) {
									console.log('error updating etl audit table with process run date',data)
									throw err
								}
								else {
									console.log('etl audit table timestamp updated for the current process, exiting...')
									shutdownProcess()
								}
							})
						}
					})
					/*	console.log('-------------------------------------------------------------------')
						console.log('rendered query', qry.sql)
						console.log('-------------------------------------------------------------------')
					*/
				}
			})
			/*	console.log('-------------------------------------------------------------------')
				console.log('rendered query', qry.sql)
				console.log('-------------------------------------------------------------------')
			*/
		}
	})

/*	console.log('-------------------------------------------------------------------')
 	console.log('rendered query', qry.sql)
	console.log('-------------------------------------------------------------------')
*/
}

loadUsers()
