var params = require('../params')
	, geoSettings = require('../data/geoSettings')
	, debug = require('debug')('tweetStream')

var tweetStream = new TweetStream()

/**
* Set of functions to extract tweets in real time
*
* @constructor
* 
*/
function TweetStream () {

	var tu = require('tuiter')(params.twitter)
		, errCount = 0

	// validate that the connection works, cf. https://github.com/impronunciable/Tuiter/issues/40
	tu.rateLimitStatus(function(err, data){
		if (err) {
			console.log('error connecting to twitter API' , data)
			throw err
		}
		else
			debug('successfully tested twitter API connection')
	})

	/****************************************
	* 
	* private methods
	* 
	****************************************/

	/**
	* monitor tweets geolocated in Belgium, using twitter's streaming API
	*
	* @private
	* 
	*/
	function streamTweets() {
		debug('running streamTweets')
		
		tu.filter({locations: [geoSettings.stream.sw, geoSettings.stream.ne]}, function(stream){
			stream.on('tweet', function(tweet){

				if (tweet.place.country_code === geoSettings.countryCode && params.twitterUsersBlacklist.indexOf(tweet.user.screen_name) === -1) {
					// send tweet to the parent process
					process.send(tweet)
				}
			})
			stream.on('error', function(err){
				console.log('error with twitter streaming API', err)
				console.log('reconnecting in (ms)', 700 * (1 + errCount * 4))
				
				stream.emit('end')
				
				setTimeout(function() {
					errCount++
					streamTweets()
				}, Math.min(700 * (1 + errCount * 4), 10000))
				
			})
		})
		
	}

	debug('starting streamTweets')
	streamTweets()

}
