let params = require('../params')
	, fork = require('child_process').fork
	, debug = require('debug')('tweets')
/**
* Set of functions to process incoming tweets
*
* @param {object} app
* 
* @constructor
* 
*/
function Tweets (app) {
	
	let self = this
		, searchHashtags = []
		
	if (typeof params.track !== 'undefined') {
		
		params.track.forEach( term => {
			if (term[0] === '#')
				searchHashtags.push(term.substr(1).toLowerCase())
		})
	}
	
	connectTweetStream()
	initTweetBot()

	/****************************************
	* 
	* private methods
	* 
	****************************************/
	
	/****************************
	* 
	* connect TweetStream
	* 
	* create the tweets extraction child process
	*
	* @private
	* 
	*****************************/
	function connectTweetStream() {
		
		this.tweetStream = fork(__dirname + '/tweetStream')

		// create listener to 'message' event
		this.tweetStream.on('message', function(tweet) {

			var data = {
				id_str: tweet.id_str
				, created_at: tweet.created_at
				, is_reply: tweet.in_reply_to_user_id !== null
				, has_hashtag: tweet.entities.hashtags.length !== 0
				, entities: []
				, relatedEntities: []
				, has_link: tweet.entities.urls.length !== 0
				, has_mention: tweet.entities.user_mentions.length !== 0
				, mentions: []
				, has_media: tweet.entities.media && tweet.entities.media.length !== 0
				, lang: tweet.lang
			}
			
			if(tweet.entities.user_mentions.length !== 0) {
				tweet.entities.user_mentions.forEach(function (m) {
					data.mentions.push(m.screen_name)
				})
			}
			
			let entities = tweet.truncated? tweet.extended_tweet.entities : tweet.entities
			
			entities.hashtags.forEach(function (h) {
				data.entities.push(formatTag(h.text))
				data.relatedEntities.push(formatTag(h.text))
			})
			
			//~ entities.user_mentions.forEach(function (m) {
				//~ data.entities.push('@' + m.screen_name)
				//~ data.relatedEntities.push('@' + m.screen_name)
			//~ })
				
				
			if (data.entities.length) {
			// the current tweet contains new entities, record entities present in the quoted and/or retweet, in order to be able to save an edge between these.
				
				// in case of quoted tweet, record hashtags of the original tweet.
				if (typeof tweet.quoted_status !== 'undefined') {
					
					entities = tweet.quoted_status.truncated? tweet.quoted_status.extended_tweet.entities : tweet.quoted_status.entities
					
					entities.hashtags.forEach(function (h) {
						if (!data.relatedEntities.includes(formatTag(h.text)))
							data.relatedEntities.push(formatTag(h.text))
					})
					
					//~ entities.user_mentions.forEach(function (m) {
						//~ if (!data.relatedEntities.includes('@' + m.screen_name))
							//~ data.relatedEntities.push('@' + m.screen_name)
					//~ })
				}
					
				// in case of retweet, record hashtags of the original tweet.
				if (typeof tweet.retweeted_status !== 'undefined') {
					
					entities = tweet.retweeted_status.truncated? tweet.retweeted_status.extended_tweet.entities : tweet.retweeted_status.entities
					
					entities.hashtags.forEach(function (h) {
						if (!data.relatedEntities.includes(formatTag(h.text)))
							data.relatedEntities.push(formatTag(h.text))
					})
					
					//~ entities.user_mentions.forEach(function (m) {
						//~ if (!data.relatedEntities.includes('@' + m.screen_name))
							//~ data.relatedEntities.push('@' + m.screen_name)
					//~ })
				}
			}
			
			//~ console.log('related entities processed', data.relatedEntities)
			
			// store new tweet, update stats, and check if top mentions ranking has changed
			var haveTopMentionsChanged = app.model.tweets.add(data)
			
			// send new tweet to the clients
			app.router.io.to('liveFeed').emit('tweet', data)
			
			if (haveTopMentionsChanged) {
				// send new top10 mentions rank to the clients
				app.router.io.to('liveFeed').emit('topMentions', app.model.tweets.getTopMentions())
			}			
			
		})
		
		// create listener to 'disconnect' event
		this.tweetStream.on('disconnect', function() {
			// restart child process in case of crash
			connectTweetStream()
		})
	}


	/****************************
	 *
	 * harmonize search hashtags case formatting
	 *
	 * @private
	 *
	 *****************************/
	function formatTag(text) {
		
		if (searchHashtags.includes(text.toLowerCase()))
			return '#' + text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
		else
			return '#' + text
	
	}


	/****************************
	 *
	 * create the tweetBot child process
	 *
	 * @private
	 *
	 *****************************/
	function initTweetBot() {
		this.tweetBot = fork(__dirname + '/tweetBot')
		this.hourlyDelay = 2 * 60 * 60 * 1000
		this.dailyDelay = 24 * 60 * 60 * 1000

		// Check if we need to send the daily tweet today, or tomorrow
		var now = new Date()
			, nextDay = (now.getHours() < params.tweetBot.autoTweetHour ? now.getDate() + 1 : now.getDate() + 2 )
			, nextDate = new Date(
								now.getFullYear()
								, now.getMonth()
								, nextDay
								, params.tweetBot.autoTweetHour, 0, 0 // ...at 10:00:00
							)


		//~ setTimeout(function () {
			//~ callTweetbot('hourly')
		//~ }, this.hourlyDelay - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds())

		//~ setTimeout(function () {
			//~ callTweetbot('daily')
		//~ }, nextDate.getTime() - now.getTime())

	}

	/****************************
	 *
	 * Call tweetbot
	 *
	 * @private
	 *
	 *****************************/
	function callTweetbot(type) {
		var delay = (type == 'hourly' ? this.hourlyDelay : this.dailyDelay)

		setTimeout(function () {
			callTweetbot(type)
		}, delay)

		this.tweetBot.send({
			'type': type
			, 'tweets': app.model.tweets.getTweetCounts()
			, 'entities': app.model.tweets.getEntitiesStats()
		})
	}


	/****************************************
	* 
	* public methods
	* 
	****************************************/

	/****************************
	 *
	 * send current dataset before initializing live feed
	 *
	 * @private
	 *
	 *****************************/
	this.initDataFeed = function(socket) {
		
		// send tweet statistics (for donut chart)
		socket.emit('tweetStats', app.model.tweets.getTweetCounts())

		// send tweet timelines (for timeline chart)
		socket.emit('timelines', app.model.tweets.getTimelines())

		// send top mentions
		socket.emit('topMentions', app.model.tweets.getTopMentions())

		// send top entities graph
		 socket.emit('entitiesGraph', app.model.tweets.getEntitiesGraph())
		
	}


}

module.exports = Tweets
