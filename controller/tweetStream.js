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
	* lookup tweets according to settings found in params.json
	*
	* @private
	* 
	*/
	function streamTweets() {
		debug('running streamTweets')
		
		let trackingConfig = {}
		
		if (params.monitor.track)
			trackingConfig.track = params.monitor.track
			
		if (params.monitor.boundingBox)
			trackingConfig.locations = [params.monitor.boundingBox.sw.long, params.monitor.boundingBox.sw.lat, params.monitor.boundingBox.ne.long, params.monitor.boundingBox.ne.lat]
			
		
		var stream = twit.stream('statuses/filter', trackingConfig)

		stream.on('tweet', function(tweet){

			debug('received tweet', tweet.id_str)

				// Quality filter: only retain tweets containing no more than 6 hashtags
				// Also exclude blacklisted usernames
				 if (tweet.entities.hashtags.length <= 6 && params.twitterUsersBlacklist.indexOf(tweet.user.screen_name) === -1) {
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
		
	}

	debug('starting streamTweets')
	streamTweets()

}
