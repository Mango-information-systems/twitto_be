const debug = require('debug')('tweetsModel')
	, d3 = require('d3')
	, debounce = require('just-debounce')
	, {UndirectedGraph} = require('graphology')
	, louvain = require('graphology-communities-louvain')
	, FA2Layout = require('graphology-layout-forceatlas2')
	, {weightedDegree} = require('graphology-metrics')
	, {subGraph} = require('graphology-utils')

/********************************************************
* Tweets datastore
* 
* @constructor
* 
*********************************************************/
function Tweets() {

	let self = this
	
	self.graph = self.filteredGraph = new UndirectedGraph()

// temp - read offline graph
	//~ const fs = require('fs')
	//~ let t = fs.readFileSync('./graphExport.json', 'utf8')
	//~ self.graph.import(JSON.parse(t))
	
	//~ console.log('graph stats', self.graph.order, self.graph.size)

	self.tweets = []
	
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
		console.log('graph stats', self.graph.order, self.graph.size)
		computeTimeline('m')
	}, 60000)
	
	// initiate a cache cleanup at the next round hour
	// based on http://stackoverflow.com/a/19847644/1006854
	var now = new Date()
		, delay = 60 * 60 * 1000
		// testing
		//~ , delay = 10 * 1000

	setTimeout(cleanCache, delay - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds())

// Temp
	//~const graph = require('../graphExport')
	//~console.log('graph', graph)


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
	
		self.tweets = self.tweets.filter(function(tweet, ix){
			
			if (new Date(Date.parse(tweet.created_at)) <= yesterday) {
			
				
				tweet.entities.forEach(function(source, i) {
				
					// decrement edge weights and remove obsolete edges
					for (var j = i+1; j < tweet.relatedEntities.length; j++) {
						
						let target = tweet.relatedEntities[j]
						
						//~ console.log('decrement edge', i, j, source, target)
						self.graph.updateEdgeAttribute(source, target, 'weight', n => n - 1)
						
						if (self.graph.getEdgeAttribute(source, target, 'weight') <= 0 ){
							console.log('dropped')
							self.graph.dropEdge(source, target)
						}
						
					}
					
					// decrement / remove nodes
					self.graph.updateNodeAttribute(source, 'count', n => n - 1)
					
					if (self.graph.getNodeAttribute(source, 'count') === 0 ){
						self.graph.dropNode(source)
					}
						
				})
				
				// remove from self.tweets
				return false
				
			}
			else
				return true
				
		})
	
		debug('after cache clean', self.tweets.length)
	
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

		debug('calculateEntitiesStats')
		
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
			
				//~if(tweet.has_hashtag) {
					
					//~tweet.hashtags.forEach(function (hashtag) {
						
						//~self.staging.hashtagsCount[hashtag] = ++self.staging.hashtagsCount[hashtag] || 1
						
					//~})
				//~}
				
				//~if(tweet.has_mention) {
					
					//~tweet.mentions.forEach(function (mention){

						//~self.staging.mentionsCount[mention] = ++self.staging.mentionsCount[mention] || 1

					//~})
				//~}
				
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
	* filter the entities graph in order to return 
	* 
	*   * only the giant component
	*   * only the top ranked entities, and related edges
	*
	* @private
	* 
	*/	
	let filterGraph = debounce(function() {
		debug('filterGraph')
		//~console.log('graph', self.graph.toJSON())
		
		if (self.graph.size > 0) {
			
			//~ console.time('FA2')
			
			FA2Layout.assign(self.graph, {
			//~ FA2Layout.assign(self.filteredGraph, {
				iterations: 50
				, settings: {
					adjustSizes: true
					, barnesHutOptimize: true
					, gravity: .5
					, strongGravityMode: true
					//~, edgeWeightInfluence: 50
					//~, scalingRatio: 2
				}
			})
			
			//~ console.timeEnd('FA2')
			
			//~ console.time('louvain')
			
			louvain.assign(self.graph)
			
			//~ console.timeEnd('louvain')
			
			//~console.log('node after layout computation', self.filteredGraph.getNodeAttributes(self.filteredGraph.nodes()[0]))
			
			//~ console.time('degree')
			const degrees = weightedDegree(self.graph, {weighted: true})
			//~ console.timeEnd('degree')
			
			// alternative: no filter by degree
			let topNodesKeys = Object.keys(degrees)
			
			//~ console.time('filterByDegree')
			
			//~ let topNodesKeys = Object.keys(degrees).filter(function(key) {
				//~ return degrees[key] > 20
			//~ })
			
			//~ console.timeEnd('filterByDegree')
			
			
			//~ console.time('sortByDegree')
			
			topNodesKeys = topNodesKeys.sort(function(a, b) {
				return degrees[b] - degrees[a]
			}).slice(0, 200)
			//~ console.timeEnd('sortByDegree')
			
			
			//~console.log('topNodesKeys', topNodesKeys)
			
			//~ console.time('subGraph')
			
			self.filteredGraph = subGraph(self.graph, topNodesKeys)
			
			//~ console.timeEnd('subGraph')
			
			
			

		}
	}, 150)
	

	// TEMP 
	
	//~self.filteredGraph = require('../graphExport')
	
	
	/**
	 *
	 * convert graph to d3 format
	 *
	 * @return {object} graph in a suitable format for use in d3
	 * 
	 * @private
	 *
	 */
	function formatGraph(graph) {

		debug('formatGraph')
		
		let res = {nodes: [], edges: []}
		
		graph.forEachNode((node, attributes) => {
			res.nodes.push({
				key: node
				, count: attributes.count
				, x: attributes.x
				, y: attributes.y
				, community: attributes.community
				//~ , weightedDegree: attributes.weightedDegree
			})
		})
		
		// TODO check whether graphology has a better way to do this
		graph.forEachEdge(function(edge, attributes, source, target) {
			let sourceIndex = res.nodes.findIndex(function(node, index){
				return node.key === source
			})
			let targetIndex = res.nodes.findIndex(function(node, index){
				return node.key === target
			})
			
			res.edges.push({
				key: source + '-' + target
				, source: sourceIndex
				, target: targetIndex
				, weight: attributes.weight
			})
		})
		
		//~console.log('formatted graph', res)
		
		return res
		
		
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
		
		//~console.log('entities', tweet.entities)
		
		//~ console.time('store nodes')
		
		// store nodes
		tweet.entities.forEach(function(entity) {
		
			//~ console.log('entity', entity)
			self.graph.mergeNode(entity, {x: Math.random(), y: Math.random()})
			
			self.graph.updateNodeAttribute(entity, 'count', n => (n || 0) + 1)

		})
		
		let extraEntities = tweet.relatedEntities.filter(entity => !tweet.entities.includes(entity))
		
		// add extra entities nodes in case they are not yet present in the graph
		// count is not incremented for these.
		extraEntities.forEach(function(entity) {
		
			self.graph.mergeNode(entity, {x: Math.random(), y: Math.random()})
			
			self.graph.updateNodeAttribute(entity, 'count', n => (n || 0) + 1)
			
		})
		
		//~ console.timeEnd('store nodes')
		
		//~ console.log('edge targets', tweet.relatedEntities)
		
		//~ console.time('store edges')
		//compute and store edges
		tweet.entities.forEach(function(source, i) {
		
			for (var j = i+1; j < tweet.relatedEntities.length; j++) {
				
				let target = tweet.relatedEntities[j]
				
				//~ console.log('saving edge', i, j, source, target)
				
				self.graph.mergeEdge(source, target)
				
				self.graph.updateEdgeAttribute(source, target, 'weight', n => (n || 0) + 1)
				
			}
			
		})
		//~ console.timeEnd('store edges')
		
		updateTweetCounts(tweet)
		
		//~ console.log('graph stats:')
		//~ console.log('-- nodes count', self.graph.order)
		//~ console.log('-- edges count', self.graph.size)
		filterGraph()
		
	}


//~ setTimeout(function() {
	//~ console.log('graph stats', self.graph.order, self.graph.size)
	//~ const fs = require('fs')
	//~ fs.writeFile('graphExport.json', JSON.stringify(self.graph.export()), 'utf8', function(err, res) {
		//~ console.log('graph export result', err, res)
	//~ })
//~ 
//~ }, 6 * 60 * 1000)

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
	* get top entities subgraph
	*
	* @return {object} trending entities graph data
	* 
	*/
	this.getEntitiesGraph = function () {
		return formatGraph(self.filteredGraph)
		//~ return formatGraph(self.graph)
		//~ return self.filteredGraph.export()
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
