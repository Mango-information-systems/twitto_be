var params = require('../params')
	, Twit = require('twit')
	, debug = require('debug')('tweetStream')

var tweetStream = new TweetStream()

/**
* Set of functions to extract tweets in real time
*
* @constructor
* 
*/
function TweetStream () {

	var twit = new Twit(params.twitter)
		, errCount = 0

	//~ // validate that the connection works, cf. https://github.com/impronunciable/Tuiter/issues/40
	//~ tu.rateLimitStatus(function(err, data){
		//~ 
		//~ if (err) {
			//~ 
			//~ console.log('error connecting to twitter API' , data)
			//~ throw err
		//~ }
		//~ else {
			//~ 
		   //~ debug('successfully tested twitter API connection. Rate-limit status:')
		   //~ debug(JSON.stringify(data.resources.tweets, null, '\t'))
	   //~ }
	   //~ 
	//~ })

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
		
		let trackingConfig = {}
		
		if (params.track)
			trackingConfig.track = params.track
			
		if (params.boundingBox)
			trackingConfig.locations = [params.boundingBox.sw.long, params.boundingBox.sw.lat, params.boundingBox.ne.long, params.boundingBox.ne.lat]
			
		
		var stream = twit.stream('statuses/filter', trackingConfig)

		stream.on('tweet', function(tweet){

			debug('received tweet', tweet.id_str)

				// TODO add check for presence of tracked entities in clause below (OR)
				//~ if (tweet.place.country_code === geoSettings.countryCode && params.twitterUsersBlacklist.indexOf(tweet.user.screen_name) === -1) {
					// send tweet to the parent process
					process.send(tweet)
				//~ }
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
		
	}

	debug('starting streamTweets')
	streamTweets()

}
