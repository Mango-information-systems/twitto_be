// daily update of twitter users information
// only processes data into a staging table
var Mysql = require('mysql')
	, _ = require('underscore')
	, params = require('./params.json')
	, tu = require('tuiter')(params.twitter)
	, timestamp = timeStampToMysqlFormat(new Date())

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

function storeResult(res) {
// store result in database
//	console.log(result)

	var queryData = _.map(res, function(item) {
		if (item.id == 22784222) console.log(timestamp)
		return [item.id, item.screen_name, item.name, item.description, item.location, item.lang, item.id_str, item.url, item.created_at, item.statuses_count, item.followers_count, item.friends_count, item.favourites_count, item.listed_count, item.time_zone, item.utc_offset, item.profile_image_url, item.profile_image_url_https, item.profile_link_color, item.profile_text_color, item.profile_background_color, item.profile_background_image_url, item.profile_background_image_url_https, item.profile_sidebar_border_color, item.profile_sidebar_fill_color, item.notifications, item.contributors_enabled, item.verified, item.is_translator, item.protected, item.geo_enabled, item.show_all_inline_media, item.default_profile_image, item.default_profile, item.profile_use_background_image, item.profile_background_tile, timestamp]
	})
	 // console.log('queryData', queryData[0])

// tmp
// var queryData = result
// console.log('escape result', mysql.escape(queryData))

	var qry = mysql.query('REPLACE INTO stg_tw_user (id, screen_name, name, description, location, lang, id_str, url, created_at, statuses_count, followers_count, friends_count, favourites_count, listed_count, time_zone, utc_offset, profile_image_url, profile_image_url_https, profile_link_color, profile_text_color, profile_background_color, profile_background_image_url, profile_background_image_url_https, profile_sidebar_border_color, profile_sidebar_fill_color, notifications, contributors_enabled, verified, is_translator, protected, geo_enabled, show_all_inline_media, default_profile_image, default_profile, profile_use_background_image, profile_background_tile, last_update) VALUES ' + mysql.escape(queryData), function(err, data) {
		if (err) {
			console.log('error storing results for ',data)
			throw err
		}
		else {
			// console.log('results saved , affected rows:', data.affectedRows)
			// console.log('results saved:', data)
			// sleep few seconds then get next batch of userIds
			_.delay(getUserIds, 500)
		}
	})
	/*
/*	console.log('-------------------------------------------------------------------')
 	console.log('rendered query', qry.sql)
	console.log('-------------------------------------------------------------------')
*/
}

function markDeleted(ids) {
// remove obsolete users, as they are not recognized in twitter anymore

	if (ids.length >= 1) {
		var qry = mysql.query('UPDATE stg_tw_user set deleted= 1 WHERE id IN (' + mysql.escape(ids) + ')', function(err, data) {
			if (err) {
				console.log('error marking obsolete users deleted ')
				throw err
			}
			else {
				// console.log('obsolete users removed, affected rows:', data.affectedRows)
				// console.log('results saved:', data)
			}
		})
		/*
		console.log('-------------------------------------------------------------------')
		console.log('rendered query', qry.sql)
		console.log('-------------------------------------------------------------------')
		*/
	}
}

function getUserInfo(ids, errCount) {
// get twitter Ids of a given community
	console.log('-------------------------------------------------------------------')
	console.log('getting updated user info from twitter... ')
	if (errCount >= 2) {
		console.log('failed too many times, skipping...')
		getUserIds()
	}
	else {
		tu.usersLookup({user_id : ids}, function(err, data) {
			if (err) {
			// sleep few seconds then retry
				if (data && data.errors && data.errors[0].code == 34) {
				// node of the users from the batch is recognized, remove them from the database
					markDeleted(ids)
					setTimeout(function() {
						getUserIds()
					}
					, 1000)
				}
				else if (data && data.errors && data.errors[0].code == 130) {
				// increment backoff in case twitter is over capacity
					setTimeout(function() {
						getUserInfo(ids, errCount+1)
					}
					, 2000 * (1 + 2 * errCount))					
				}
				else {
					console.log('error looking up users', data)
					console.log('reattempting...')
					setTimeout(function() {
						getUserInfo(ids, errCount+1)
					}
					, 500)					
				}
			}
			else {
				// remove deleted users
				markDeleted(_.difference(ids, _.pluck(data, 'id')))
				// update users info
				storeResult(data)
			}
		})
	}
}

function getUserIds() {
// get least recently updated twitter users
	console.log('------------------- looking up users in stg_tw_user')
	var qry = mysql.query('select id from stg_tw_user where (last_update < CURDATE() - INTERVAL 1 DAY OR last_update is null) and deleted = 0 order by last_update limit 100', function(err, res) {
		if (err) throw err
		else {
			if (res.length == 0) {
				console.log('processing finished successfully')
				shutdownProcess()
			}
			else {
				// console.log(res.length, 'results, first one: ', res[0].id)
				var userIds = _.pluck(res, 'id')
				getUserInfo(userIds, 0)
			}
		}
	})	
	// console.log('rendered query', qry.sql)
}

getUserIds()
