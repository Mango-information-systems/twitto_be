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
	* connectTweetStream
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
				, hashtags: []
				, has_link: tweet.entities.urls.length !== 0
				, has_mention: tweet.entities.user_mentions.length !== 0
				, mentions: []
				, has_media: tweet.entities.media && tweet.entities.media.length !== 0
				, lang: tweet.lang
			}

			if(tweet.entities.hashtags.length !== 0){
				tweet.entities.hashtags.forEach(function (h) {
					data.hashtags.push(h.text)
				})
			}

			if(tweet.entities.user_mentions.length !== 0) {
				tweet.entities.user_mentions.forEach(function (m) {
					data.mentions.push(m.screen_name)
				})
			}
				
			
			// store new tweet, update stats, and check for changed.
			var hasRankingChanged = app.model.tweets.add(data)
			
			// send new tweet to the clients
			app.controller.io.sockets.emit('tweet', data)
			
			if (hasRankingChanged) {
				// send new top10 ranks to the clients
				app.controller.io.sockets.emit('entitiesStats', app.model.tweets.getEntitiesStats())
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


		setTimeout(function () {
			callTweetbot('hourly')
		}, this.hourlyDelay - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds())

		setTimeout(function () {
			callTweetbot('daily')
		}, nextDate.getTime() - now.getTime())

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
