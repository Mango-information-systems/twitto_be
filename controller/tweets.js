const params = require('../params')
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
	
	if (params.searchTerm)
		setTimeout(connectTweetSearch, 10000)
	else
		connectTweetStream()
		
	initTweetBot()

	/****************************************
	* 
	* private methods
	* 
	****************************************/
	
	/****************************
	* 
	* connect TweetSeach
	* 
	* create the tweets extraction child process
	*
	* @private
	* 
	*****************************/
	function connectTweetSearch() {
		
		this.tweetSearch = fork(__dirname + '/tweetSearch')

		// create listener to 'message' event
		this.tweetSearch.on('message', function(tweets) {

			tweets.forEach(function(tweet) {
				let data = {
					id_str: tweet.id_str
					, created_at: tweet.created_at
					, is_reply: tweet.in_reply_to_user_id !== null
					, has_hashtag: tweet.entities.hashtags.length !== 0
					, has_mention: tweet.entities.user_mentions.length !== 0
					, has_link: tweet.entities.urls.length !== 0
					, has_media: tweet.entities.media && tweet.entities.media.length !== 0
					, hashtags: []
					, mentions: []
				}
				
				let entities = tweet.truncated && !tweet.entities ? tweet.extended_tweet.entities : tweet.entities
				
				entities.user_mentions.forEach(function (m) {
					data.mentions.push(m.screen_name)
				})
				
				entities.hashtags.forEach(function (h) {

					data.hashtags.push(formatTag(h.text))
				})
					
				if (data.hashtags.length) {
				// the current tweet contains new hashtags
				// record hashtags present in the quoted and/or retweet
				//  in order to be able to save an edge between these.
					
					if (typeof tweet.quoted_status !== 'undefined') {
						
						entities = tweet.quoted_status.truncated && !tweet.quoted_status.entities ? tweet.quoted_status.extended_tweet.entities : tweet.quoted_status.entities
						
						entities.hashtags.forEach(function (h) {
							if (!data.hashtags.includes(formatTag(h.text)))
								data.hashtags.push(formatTag(h.text))
						})
					}
						
					if (typeof tweet.retweeted_status !== 'undefined') {
						
						if (tweet.retweeted_status.truncated)
							console.log('truncated', JSON.stringify(tweet, null, '  '))
						
						entities = tweet.retweeted_status.truncated && !tweet.retweeted_status.entities ? tweet.retweeted_status.extended_tweet.entities : tweet.retweeted_status.entities
						
						entities.hashtags.forEach(function (h) {
							if (!data.hashtags.includes(formatTag(h.text)))
								data.hashtags.push(formatTag(h.text))
						})
					}
				}
				
				// store new tweet, update stats, and check if top mentions ranking has changed
				let haveTopMentionsChanged = app.model.tweets.add(data)
				
				// send new tweet to the clients
				app.router.io.to('liveFeed').emit('tweet', data)
				
				if (haveTopMentionsChanged) {
					// send new top10 mentions rank to the clients
					app.router.io.to('liveFeed').emit('topMentions', app.model.tweets.getTopMentions())
				}
			})
			
		})
		
		// create listener to 'disconnect' event
		this.tweetSearch.on('disconnect', function() {
			console.log('tweetSearch disconnected')
		})
	}

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

			let data = {
				id_str: tweet.id_str
				, created_at: tweet.created_at
				, is_reply: tweet.in_reply_to_user_id !== null
				, has_hashtag: tweet.entities.hashtags.length !== 0
				, has_mention: tweet.entities.user_mentions.length !== 0
				, has_link: tweet.entities.urls.length !== 0
				, has_media: tweet.entities.media && tweet.entities.media.length !== 0
				, hashtags: []
				, mentions: []
			}
			
			let entities = tweet.truncated? tweet.extended_tweet.entities : tweet.entities
			
			entities.user_mentions.forEach(function (m) {
				data.mentions.push(m.screen_name)
			})
			
			entities.hashtags.forEach(function (h) {

				data.hashtags.push(formatTag(h.text))
			})
				
			if (data.hashtags.length) {
			// the current tweet contains new hashtags
			// record hashtags present in the quoted and/or retweet
			//  in order to be able to save an edge between these.
				
				if (typeof tweet.quoted_status !== 'undefined') {
					
					entities = tweet.quoted_status.truncated? tweet.quoted_status.extended_tweet.entities : tweet.quoted_status.entities
					
					entities.hashtags.forEach(function (h) {
						if (!data.hashtags.includes(formatTag(h.text)))
							data.hashtags.push(formatTag(h.text))
					})
				}
					
				if (typeof tweet.retweeted_status !== 'undefined') {
					
					entities = tweet.retweeted_status.truncated? tweet.retweeted_status.extended_tweet.entities : tweet.retweeted_status.entities
					
					entities.hashtags.forEach(function (h) {
						if (!data.hashtags.includes(formatTag(h.text)))
							data.hashtags.push(formatTag(h.text))
					})
				}
			}
			
			// store new tweet, update stats, and check if top mentions ranking has changed
			let haveTopMentionsChanged = app.model.tweets.add(data)
			
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
		//~ testing values
		//~this.hourlyDelay = 6 * 1000
		//~this.dailyDelay = 10 * 1000

		// Check if we need to send the daily tweet today, or tomorrow
		let now = new Date()
			, nextDay = (now.getHours() < params.tweetBot.autoTweetHour ? now.getDate() + 1 : now.getDate() + 2 )
			, nextDate = new Date(
								now.getFullYear()
								, now.getMonth()
								, nextDay
								, params.tweetBot.autoTweetHour, 0, 0 // ...at 10:00:00
							)

		setTimeout(function () {
			console.log('calling hourly tweetBot')
			callTweetbot('hourly')
		}, this.hourlyDelay - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds())

		setTimeout(function () {
			console.log('calling daily tweetBot')
			callTweetbot('daily')
		}, nextDate.getTime() - now.getTime())
		//~}, this.dailyDelay - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds())

	}

	/****************************
	 *
	 * Call tweetbot
	 *
	 * @private
	 *
	 *****************************/
	function callTweetbot(type) {
		let delay = (type == 'hourly' ? this.hourlyDelay : this.dailyDelay)

		setTimeout(function () {
			callTweetbot(type)
		}, delay)

		this.tweetBot.send({
			'type': type
			, 'content': app.model.tweets.getEntitiesStats()
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
