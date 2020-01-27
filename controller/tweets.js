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
	
	var self = this
	
	this.app = app

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
				, has_media: tweet.entities.media && tweet.entities.media.length !== 0
				, lang: tweet.lang
			}
			
			// tmp - check entities actually present in the tweet. 
			//~ if (!tweet.entities.hashtags.find(t => t.text.toLowerCase() ==='trump')) {
				//~ console.log('--------------------------------------------')
				//~ console.log('missing', tweet.text, JSON.stringify(tweet.entities.hashtags, null, '    '))
				//~ console.log('related entities', JSON.stringify(tweet, null, '    '))
			//~ }

			let entities = tweet.truncated? tweet.extended_tweet.entities : tweet.entities
			
			entities.hashtags.forEach(function (h) {
				data.entities.push('#' + h.text)
				data.relatedEntities.push('#' + h.text)
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
						if (!data.relatedEntities.includes('#' + h.text))
							data.relatedEntities.push('#' + h.text)
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
						if (!data.relatedEntities.includes('#' + h.text))
							data.relatedEntities.push('#' + h.text)
					})
					
					//~ entities.user_mentions.forEach(function (m) {
						//~ if (!data.relatedEntities.includes('@' + m.screen_name))
							//~ data.relatedEntities.push('@' + m.screen_name)
					//~ })
				}
			}
			
			//~ console.log('related entities processed', data.relatedEntities)
			// store new tweet, update stats.
			app.model.tweets.add(data)
			
			// send new tweet to the clients
			app.controller.io.sockets.emit('tweet', data)
			// send graph
			app.controller.sendGraph()
			
			
			
		})
		
		// create listener to 'disconnect' event
		this.tweetStream.on('disconnect', function() {
			// restart child process in case of crash
			connectTweetStream()
		})
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

	/**
	 *
	 * Call tweetbot
	 *
	 * @private
	 *
	 */
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

}

module.exports = Tweets
