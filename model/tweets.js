var debug = require('debug')('tweetsModel')
	, d3 = require('d3')

/********************************************************
* Tweets datastore
* 
* @constructor
* 
*********************************************************/
function Tweets(storage) {

	var self = this

	if (storage.keys().indexOf('tweets') === -1) {
		// no tweets are already stored
		self.tweets = []
		// initialize tweets storage to an empty array in case 
		storage.setItemSync('tweets', [])
	}
	else {
		// cache persisted tweets
		self.tweets = storage.getItemSync('tweets')
	}
	
	self.stats = {
		tweets: {} // tweets counts (# replies, hashtags, links etc)
		, entities: {} // trending entities (top hashtags / mentions)
	}
	
	// compute tweet statistics
	calculateTweetCounts()
	
	calculateEntitiesStats()

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
		
		// schedule next execution in an hour
		setTimeout(cleanCache, delay)
		
		// console.log('before cache clean', self.tweets.length)
		
		var yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
	
		self.tweets = self.tweets.filter(function(tweet, ix){
			
			return new Date(Date.parse(tweet.created_at)) > yesterday
				
		})
	
		// console.log('after cache clean', self.tweets.length)
	
		storage.setItem('tweets', self.tweets)
		
		// recompute statistics after a cache cleanup
		calculateTweetCounts()
		
		calculateEntitiesStats()
		
	}

	/**
	 *
	 * Calculate top stats (hashtags or mentions)
	 *
	 * @private
	 *
	 */
	function calculateEntitiesStats() {

		// staging area keeping the number of occurence of each hashtag and mention, and threshold count to enter in the top 10
		self.staging = {
			hashtagsCount: {}
			, topHashtagCountThreshold: 0
			, mentionsCount: {}
			, topMentionCountThreshold: 0
		}
		
		self.stats.entities.topHashtags = []
		self.stats.entities.topMentions = []

		var now = new Date()
			, hoursAgo = 2 * 60 * 60 * 1000
			, currentIndex = self.tweets.length-1
			, withinTimeframe = true

		// iterate through the tweets to extract mentions and hashtags
		// while loop used to start from more recent tweets, and move backwards until 2 hours ago.
		while(withinTimeframe && currentIndex >= 0) {

			var tweet = self.tweets[currentIndex]
			
			if (now - (new Date(tweet.created_at)) > hoursAgo) {
				// tweet is older than 2 hours ago, exit loop
				withinTimeframe = false
			}
			else {
			// populate the staging array with count of each hashtag and mention from recent tweets
			
				if(tweet.has_hashtag) {
					
					tweet.hashtags.forEach(function (hashtag) {
						
						self.staging.hashtagsCount[hashtag] = ++self.staging.hashtagsCount[hashtag] || 1
						
					})
				}
				
				if(tweet.has_mention) {
					
					tweet.mentions.forEach(function (mention){

						self.staging.mentionsCount[mention] = ++self.staging.mentionsCount[mention] || 1

					})
				}
				
				currentIndex--
			}

		}
		
		// TODO make the following DRY: run the same code for mentions and for hashtags
		
		// extract the top10 hashtags
		Object.keys(self.staging.hashtagsCount).forEach( function(hashtag) {
			
			var count = self.staging.hashtagsCount[hashtag]
			
			// check whether the number of occurences of this hashtag is greater than lowest value currently in the top10
			if (self.stats.entities.topHashtags.length < 10 || count >= self.staging.topHashtagCountThreshold) {
				
				// add new value to the top 10
				self.stats.entities.topHashtags.push({
					key: hashtag
					, value: count
				})
				
				// update threshold value: get the lowest value from the array
				self.staging.topHashtagCountThreshold = self.stats.entities.topHashtags.reduce(function(memo, topHashtag) {
					return Math.min(memo, topHashtag.value)
				}, +Infinity)
			}
			
		})
		
		// sort the top ranking
		self.stats.entities.topHashtags.sort(function(a, b) {
			
			return b.value !== a.value? b.value - a.value : b.key.toLowerCase() < a.key.toLowerCase()
		})
		
		// timit to top 10 values
		self.stats.entities.topHashtags = self.stats.entities.topHashtags.slice(0, 10)
		
		// extract the top10 mentions
		Object.keys(self.staging.mentionsCount).forEach( function(mention) {
			
			var count = self.staging.mentionsCount[mention]
			
			// check whether the number of occurences of this mention is greater than lowest value currently in the top10
			if (self.stats.entities.topMentions.length < 10 || count >= self.staging.topMentionCountThreshold) {
				
				// add new value to the top 10
				self.stats.entities.topMentions.push({
					key: mention
					, value: count
				})
				
				// update threshold value
				self.staging.topMentionCountThreshold = count
				
				// update threshold value: get the lowest value from the array
				self.staging.topMentionCountThreshold = self.stats.entities.topMentions.reduce(function(memo, topMention) {
					return Math.min(memo, topMention.value)
				}, +Infinity)
			}
			
		})
		
		// sort the top ranking
		self.stats.entities.topMentions.sort(function(a, b) {
			return b.value !== a.value? b.value - a.value : b.key.toLowerCase() < a.key.toLowerCase()
		})
		
		// timit to top 10 values
		self.stats.entities.topMentions = self.stats.entities.topMentions.slice(0, 10)
		
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
		var tweetsTimeline = d3.range(barCount).map(function(d, i) {
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
					//~ 
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
	* Calculate tweet statistics: number of retweets, mentions, hashtags etc
	*
	* @private
	* 
	*/	
	function calculateTweetCounts(){
		
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
	* update entities statistics
	*
	* @param {object} tweet new tweet
	* 
	* @return {boolean} has any of the top10 rankings changed
	* 
	* @private
	* 
	*/	
	function updateEntityStats(tweet){
		
		// update mentions and hashtags counts, and if appropriate, the top 10 ranking
		
		var topHashtagsChanged = false
			, topMentionsChanged = false
			
		if(tweet.has_hashtag) {
			
			tweet.hashtags.forEach(function (hashtag) {
				
				self.staging.hashtagsCount[hashtag] = ++self.staging.hashtagsCount[hashtag] || 1
				
				var count = self.staging.hashtagsCount[hashtag]
				
				// check whether the number of occurences of this hashtag is greater than lowest value currently in the top10
				if (self.stats.entities.topHashtags.length < 10 || count >= self.staging.topHashtagCountThreshold) {
					
					topHashtagsChanged = true
					
					//check whether this hashtag was already inside the top10 ranking
					var hashtagIndex = self.stats.entities.topHashtags.findIndex(function(topHashtag) {
						return topHashtag.key === hashtag
					})

					if (hashtagIndex !== -1) {
						// update count value inside the top10 ranking
						self.stats.entities.topHashtags[hashtagIndex].value = count
					}
					else {
						// this hashtag is new inside the top 10
						// add new value to the top 10
						self.stats.entities.topHashtags.push({
							key: hashtag
							, value: count
						})
					}
					
					// update threshold value
					self.staging.topHashtagCountThreshold = self.stats.entities.topHashtags.reduce(function(memo, topHashtag) {
						return Math.min(memo, topHashtag.value)
					}, +Infinity)
				}
				
			})
			
			if (topHashtagsChanged) {
				
				// sort the top ranking
				self.stats.entities.topHashtags.sort(function(a, b) {
					return b.value !== a.value? b.value - a.value : b.key.toLowerCase() < a.key.toLowerCase()
				})
				
				// timit to top 10 values
				self.stats.entities.topHashtags = self.stats.entities.topHashtags.slice(0, 10)
				
			}
		}
		
		if(tweet.has_mention){
			
			tweet.mentions.forEach(function (mention) {
				
				self.staging.mentionsCount[mention] = ++self.staging.mentionsCount[mention] || 1
				
				var count = self.staging.mentionsCount[mention]
				
				// check whether the number of occurences of this mention is greater than lowest value currently in the top10
				if (self.stats.entities.topMentions.length < 10 || count >= self.staging.topMentionCountThreshold) {
					
					topMentionsChanged = true
					
					//check whether this mention was already inside the top10 ranking
					var mentionIndex = self.stats.entities.topMentions.findIndex(function(topMention) {
						return topMention.key === mention
					})

					if (mentionIndex !== -1) {
						// update count value inside the top10 ranking
						self.stats.entities.topMentions[mentionIndex].value = count
					}
					else {
						// this mention is new inside the top 10
						// add new value to the top 10
						self.stats.entities.topMentions.push({
							key: mention
							, value: count
						})
					}
					
					// update threshold value
					self.staging.topMentionCountThreshold = self.stats.entities.topMentions.reduce(function(memo, topMention) {
						return Math.min(memo, topMention.value)
					}, +Infinity)
				}
				
			})
			
			if (topMentionsChanged) {
				
				// sort the top ranking
				self.stats.entities.topMentions.sort(function(a, b) {
					return b.value !== a.value? b.value - a.value : b.key.toLowerCase() < a.key.toLowerCase()
				})
				
				// timit to top 10 values
				self.stats.entities.topMentions = self.stats.entities.topMentions.slice(0, 10)
				
			}
		}
		
		return topHashtagsChanged || topMentionsChanged
		
	}
		
	/**
	* 
	* count new tweet in the tweets per minute time series data
	*
	* @private
	* 
	*/	
	function updateTimeline(){
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
	* store a new tweet
	*
	* @return {boolean} flag indicating whether top hashtags and/or top mentions ranking has changed
	* 
	*/
	this.add = function(tweet) {
		
		debug('adding tweet', tweet)
		
		self.tweets.push(tweet)
		
		storage.setItem('tweets', self.tweets)
		
		updateTweetCounts(tweet)
		
		return updateEntityStats(tweet)
	}

	/**
	* 
	* get all tweets
	*
	* @return {object} all tweets
	* 
	*/
	this.getAllTweets = function() {
		return self.tweets
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
	* get top entities (trending hashtags / mentions)
	*
	* @return {object} trending entities stats
	* 
	*/
	this.getEntitiesStats = function () {
		return self.stats.entities
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
				
		return {
			perSecond: perSecond
			, perMinute: self.tweetsPerMinute
		}
		
	}
	
	

}

module.exports = Tweets
