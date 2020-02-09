const debug = require('debug')('tweetsModel')
	, fork = require('child_process').fork
	, range = require('d3-array').range

/********************************************************
* Tweets datastore
* 
* @constructor
* 
*********************************************************/
function Tweets(model) {

	let self = this
	
	self.graph = {}

	self.tweets = []
	
	// entitiesGraph is in a child process because it is CPU intensive
	self.entitiesGraphWorker = fork(__dirname + '/entitiesGraph-worker')
	
	self.entitiesGraphWorker.on('message', function(data) {
		self.graph = data
		
		model.emit('graphUpdate', self.graph)
	})
	
	self.stats = {
		tweets: {} // tweets counts (# replies, hashtags, links etc)
		, topMentions: []
	}
	
	// compute tweet statistics
	calculateTweetCounts()
	calculateTopMentions()

	// compute tweets time series
	//  TODO do this 60 seconds after server start - init to empty timeline in the mean time
	self.tweetsPerMinute = computeTimeline('m')

//~ console.log('self.stats', JSON.stringify(self.stats, null, '    '))

	// update tweets per minute statistics every minute
	setInterval(function() {
		computeTimeline('m')
	}, 60000)
	
	// initiate a cache cleanup at the next round hour
	// based on http://stackoverflow.com/a/19847644/1006854
	var now = new Date()
		, delay = 60 * 60 * 1000
		// testing
		 //~, delay = 10 * 1000

	setTimeout(cleanCache, delay - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds())

	/********************************************************
	* 
	* Private functions
	* 
	*********************************************************/

	/**
	* 
	* Remove all cached tweets older than 24 hours
	*
	* @private
	* 
	*/
	function cleanCache() {
		
		debug('cleanCache: removing old tweets')
		
		// schedule next execution in an hour
		setTimeout(cleanCache, delay)
		
		debug('before cache clean', self.tweets.length)
		
		let yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		
		// temp: testing cleanup by expiring tweets from few moments ago instead of 1 day ago
		//~ let yesterday = new Date(new Date() - 30000)
		
		let tweetsToCleanup = []
	
		self.tweets = self.tweets.filter(function(tweet, ix){
			
			if (new Date(Date.parse(tweet.created_at)) <= yesterday) {
				
				// store obsolete tweets to send to entitiesGraph child process for cleanup
				tweetsToCleanup.push(getTweetEntitiesData(tweet))
				
				// remove from self.tweets
				return false
				
			}
			else
				return true
				
		})
		
		self.entitiesGraphWorker.send({op: 'clean', data: tweetsToCleanup})
	
		debug('after cache clean', self.tweets.length)
	
		// recompute statistics after a cache cleanup
		calculateTweetCounts()
		calculateTopMentions()
		
	}

	/**
	* 
	* Calculate tweet time series data
	* 
	* @param {string} granularity desired ('m', 's')
	* 
	* @return {object} tweets count time series
	*
	* @private
	* 
	*/	
	function computeTimeline (granularity){

		debug('computeTimeline')
	
		if (granularity === 'm') {
			var timeRes = 60000
				, barCount = 30
		}
		else {
			var timeRes = 1000
				, barCount = 60
		}
		
		var ts = Date.now()
			, position = self.tweets.length-1
			, allValidTweetsProcessed = false
			, barId = 0
			
		// initialize data structure
		var tweetsTimeline = range(barCount).map(function(d, i) {
			return {
				id: ++barId // id to be used as data key by d3 in the client
				, count: 0
			}
		})
		
		if (position !== -1) {
			// update count per minute/second until we reach tweets older than 60 seconds / 30 minutes ago
			while(!allValidTweetsProcessed && position) {
				
				var barIndex = Math.floor((ts - Date.parse(self.tweets[position].created_at)) / timeRes)
				
				//~ if (granularity == 'm') {
					//~ console.log('ts', ts)
					//~ console.log('created_at', self.tweets[position].created_at)
					//~ console.log('Date.parse(self.tweets[position].created_at)', Date.parse(self.tweets[position].created_at))
					//~ console.log('(ts - Date.parse(self.tweets[position].created_at)', (ts - Date.parse(self.tweets[position].created_at)))
					//~ console.log('barIndex', barIndex)
					
				//~ }
				
				if (barIndex > barCount-1)
				// the tweet is older than the monitored time interval, consider stats calculation done
					allValidTweetsProcessed = true
				else {
					tweetsTimeline[barCount-1 - barIndex].count += 1				
					position--
				}
			}
		}
		
		//~ if (granularity == 'm') {
			//~ console.log(JSON.stringify(tweetsTimeline))
		//~ }
		
		
		return tweetsTimeline
		
	}


	/**
	 *
	 * Calculate top mentions
	 *
	 * @private
	 *
	 */
	function calculateTopMentions() {

		// staging area keeping the number of occurence of each mention, and threshold count to enter in the top 10
		self.staging = {
			mentionsCount: {}
			, topMentionCountThreshold: 0
		}
		
		self.stats.topMentions = []

		var now = new Date()
			, hoursAgo = 2 * 60 * 60 * 1000
			, currentIndex = self.tweets.length-1
			, withinTimeframe = true

		// iterate through the tweets to extract mentions and hashtags
		// while loop used to start from more recent tweets, and move backwards until 2 hours ago.
		while(withinTimeframe && currentIndex >= 0) {

			var tweet = self.tweets[currentIndex]
			
			if (now - (new Date(tweet.created_at)) > hoursAgo) {
				// tweet  is older than 2 hours ago, exit loop
				withinTimeframe = false
			}
			else {
			// populate the staging array with count of each mention from recent tweets
				
				if(tweet.has_mention) {
					
					tweet.mentions.forEach(function (mention){

						self.staging.mentionsCount[mention] = ++self.staging.mentionsCount[mention] || 1

					})
				}
				
				currentIndex--
			}

		}
		
		// extract the top10 mentions
		Object.keys(self.staging.mentionsCount).forEach( function(mention) {
			
			var count = self.staging.mentionsCount[mention]
			
			// check whether the number of occurences of this mention is greater than lowest value currently in the top10
			if (self.stats.topMentions.length < 10 || count >= self.staging.topMentionCountThreshold) {
				
				// add new value to the top 10
				self.stats.topMentions.push({
					key: mention
					, value: count
				})
				
				// update threshold value
				self.staging.topMentionCountThreshold = count
				
				// update threshold value: get the lowest value from the array
				self.staging.topMentionCountThreshold = self.stats.topMentions.reduce(function(memo, topMention) {
					return Math.min(memo, topMention.value)
				}, +Infinity)
			}
			
		})
		
		// sort the top ranking
		self.stats.topMentions.sort(function(a, b) {
			return b.value !== a.value? b.value - a.value : b.key.toLowerCase() < a.key.toLowerCase()
		})
		
		// timit to top 10 values
		self.stats.topMentions = self.stats.topMentions.slice(0, 10)
		
	}

	/**
	* 
	* Calculate tweet statistics: number of retweets, mentions, hashtags etc
	*
	* @private
	* 
	*/	
	function calculateTweetCounts(){

		debug('calculateTweetCounts')
		
		self.stats.tweets.replyCount = 0
		self.stats.tweets.hashtagCount = 0
		self.stats.tweets.linkCount = 0
		self.stats.tweets.mentionCount = 0
		self.stats.tweets.mediaCount = 0
		
		self.tweets.forEach(function(t) {
			
			if(t.is_reply)
				self.stats.tweets.replyCount++
			
			if(t.has_hashtag)
				self.stats.tweets.hashtagCount++
			
			if(t.has_link)
				self.stats.tweets.linkCount++
			
			if(t.has_mention)
				self.stats.tweets.mentionCount++
			
			if(t.has_media)
				self.stats.tweets.mediaCount++
				
		})
		
		self.stats.tweets.totalCount = self.tweets.length
		
	}

	/**
	* 
	* create object containing only relevant properties for entities graph
	* This is to decrease the volume of data sent to child process.
	*
	* @param {object} tweet
	* 
	* @return {object} tweet entities arrays
	*
	* @private
	* 
	*/	
	function getTweetEntitiesData(tweet) {
		return {
			entities: tweet.entities
			, relatedEntities: tweet.relatedEntities
		}
	}

/**
	* 
	* update top mentions statistics
	*
	* @param {object} tweet new tweet
	* 
	* @return {boolean} has any of the top10 rankings changed
	* 
	* @private
	* 
	*/	
	function updateMentionsStats(tweet){
		
		// update mentions counts, and if appropriate, the top 10 ranking
		
		var  topMentionsChanged = false
		
		if(tweet.has_mention) {
			
			tweet.mentions.forEach(function (mention) {
				
				self.staging.mentionsCount[mention] = ++self.staging.mentionsCount[mention] || 1
				
				var count = self.staging.mentionsCount[mention]
				
				// check whether the number of occurences of this mention is greater than lowest value currently in the top10
				if (self.stats.topMentions.length < 10 || count >= self.staging.topMentionCountThreshold) {
					
					topMentionsChanged = true
					
					// check whether this mention was already inside the top10 ranking
					var mentionIndex = self.stats.topMentions.findIndex(function(topMention) {
						return topMention.key === mention
					})

					if (mentionIndex !== -1) {
						// update count value inside the top10 ranking
						self.stats.topMentions[mentionIndex].value = count
					}
					else {
						// this mention is new inside the top 10
						// add new value to the top 10
						self.stats.topMentions.push({
							key: mention
							, value: count
						})
					}
					
					// update threshold value
					self.staging.topMentionCountThreshold = self.stats.topMentions.reduce(function(memo, topMention) {
						return Math.min(memo, topMention.value)
					}, +Infinity)
				}
				
			})
			
			if (topMentionsChanged) {
				
				// sort the top ranking
				self.stats.topMentions.sort(function(a, b) {
					return b.value !== a.value? b.value - a.value : b.key.toLowerCase() < a.key.toLowerCase()
				})
				
				// timit to top 10 values
				self.stats.topMentions = self.stats.topMentions.slice(0, 10)
				
			}
		}
		
		return topMentionsChanged
		
	}
	
	/**
	* 
	* count new tweet in the tweets per minute time series data
	*
	* @private
	* 
	*/	
	function updateTimeline(){

		debug('updateTimeline')
		
		self.tweetsPerMinute[self.tweetsPerMinute.length-1].count++
	}

	/**
	* 
	* update tweet statistics
	*
	* @param {object} tweet new tweet
	* 
	* @private
	* 
	*/
	function updateTweetCounts(tweet){

		debug('updateTweetCounts')

		if (tweet.is_reply)
			self.stats.tweets.replyCount++
		
		self.stats.tweets.totalCount++
		
	}

	/********************************************************
	* 
	* Public functions
	* 
	*********************************************************/

	/**
	* 
	* store a new tweet's data
	*
	*/
	this.add = function(tweet) {
		
		debug('adding tweet', tweet)
		
		self.tweets.push(tweet)
		
		self.entitiesGraphWorker.send({op: 'add', data: getTweetEntitiesData(tweet)})
				
		updateTweetCounts(tweet)
		
		return updateMentionsStats(tweet)
				
	}

	/**
	* 
	* get tweet counts statistics
	*
	* @return {object} tweet counts statistics
	* 
	*/
	this.getTweetCounts = function() {
		return self.stats.tweets
	}

	/**
	* 
	* get top mentions ranking
	*
	* @return {object} trending mentions ranking
	* 
	*/
	this.getTopMentions = function () {
		return self.stats.topMentions
	}
	
	/**
	* 
	* get top entities subgraph
	*
	* @return {object} trending entities graph data
	* 
	*/
	this.getEntitiesGraph = function () {
		return self.graph
	}
	
	/**
	* 
	* get tweets timeline
	* * stats per second are computed on the fly
	* * stats per minute are retrieved from the cache (updated every minute)
	* 
	*
	* @return {object} tweets per minute and second stats
	* 
	*/
	this.getTimelines = function() {
		
		var perSecond = computeTimeline('s')
			, perMinute = computeTimeline('m')
				
		return {
			perSecond: perSecond
			, perMinute: perMinute
		}
		
	}
	
	

}

module.exports = Tweets
