const params = require('../params')
	, Twit = require('twit')
	, debug = require('debug')('tweetStream')

let tweetStream = new TweetStream()

/**
* Set of functions to extract tweets in real time
*
* @constructor
* 
*/
function TweetStream () {

	let self = this
		, twit = new Twit(params.twitter)

	/****************************************
	* 
	* private methods
	* 
	****************************************/

	/**
	* lookup tweets according to monitoring settings
	*
	* @private
	* 
	*/
	function streamTweets(errCount) {
		debug('running streamTweets')
		
		if (typeof self.stream !== 'undefined'){
			debug('stop stream before restarting')
			self.stream.stop()
		}

		let trackingConfig = {}
		
		if (params.monitor.track)
			trackingConfig.track = params.monitor.track
		
		if (self.follow)
			trackingConfig.follow = self.follow
			
		if (params.monitor.boundingBox)
			trackingConfig.locations = [params.monitor.boundingBox.sw.long, params.monitor.boundingBox.sw.lat, params.monitor.boundingBox.ne.long, params.monitor.boundingBox.ne.lat]
		
		debug('trackingConfig', trackingConfig)
		
		self.stream = twit.stream('statuses/filter', trackingConfig)

		self.stream.on('tweet', function(tweet){

			debug('received tweet', tweet.id_str)

				// Quality filter: only retain tweets containing no more than 6 hashtags
				// Also exclude blacklisted usernames
				 if (tweet.entities.hashtags.length <= 6 && params.twitterUsersBlacklist.indexOf(tweet.user.screen_name) === -1) {
					// send tweet to the parent process
					process.send(tweet)
				 }
		})
		
		self.stream.on('error', function(err){
			console.log('error with twitter streaming API', err)
			console.log('reconnecting in (ms)', 700 * (1 + errCount * 4))
			
			self.stream.emit('end')
			
			setTimeout(function() {
				streamTweets(++errCount)
			}, Math.min(700 * (1 + errCount * 4), 10000))
			
		})
		
	}


	/**
	 * Extract the twitter Ids of list members
	*
	* @private
	* 
	*/
	function updateFollowList(errCount) {
		
		debug('updating follow list')

		// list follow is limited to 2000 members only to keep resources usage low
		twit.get('lists/members', {list_id: params.monitor.list, count: 2000}, function (err, listMembers, response) {
			
			if(err) {
				console.log('error with twitter listMembers API', err)
				
				setTimeout(function () {
					errCount++
					updateFollowList(errCount)
				}, Math.min(700 * (1 + errCount * 4), 10000))
			}
			else {
				
				if (listMembers.users.length) {
					debug('twitter list members count', listMembers.users.length)
					
					self.follow = listMembers.users.map(function (member) {
						return member.id_str
					})
					
					streamTweets(0)
				}
				else
					console.error('Cannot start or update monitor: empty list received from twitter')
			}
		})
		
	}

	debug('starting streamTweets')
	
	if (params.monitor.list) {
	// monitoring paramers request to retrieve the tweets of a set of users from a twitter list
		updateFollowList(0)

		// Update the list of twitter users to follow every 12 hours
		setInterval(function () {
			updateFollowList(0)
		}, 12 * 60 * 60 * 1000)

	}
	else
		streamTweets(0)

}
