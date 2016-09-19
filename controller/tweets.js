var debug = require('debug')('tweets')
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
		
		this.tweetStream = require('child_process').fork(__dirname + '/tweetStream')
	
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
				
			if (tweet.geo) {
				//~ // console.log('tweet with .geo', msg.geo)
				data.coordinates = [tweet.geo.coordinates[1], tweet.geo.coordinates[0]]
			}
			else if (tweet.place.place_type !== 'country'){
				 //~ console.log('place', JSON.stringify(msg.place.bounding_box.coordinates))
				data.coordinates = generateRandomPointwithinBbox(tweet.place.bounding_box.coordinates[0])
			}
			
			app.model.tweets.add(data)
			app.controller.io.sockets.emit('tweet', data)
		})
		
		// create listener to 'disconnect' event
		this.tweetStream.on('disconnect', function() {
			// restart child process in case of crash
			connectTweetStream()
		})
	}
	
	/****************************
	* 
	* generateRandomPointwithinBbox
	* 
	* when tweets point to a city instead of an exact point, point to a random location around the center of city's bounding box
	*
	* @param {object} bbox array
	* 
	* @return {object} array of latitude and longitude
	* 
	* @private
	* 
	*****************************/
	function generateRandomPointwithinBbox(bbox) {
		debug('running generateRandomPointwithinBbox')
		
		deltaSignLat = Math.sign(Math.round(Math.random()) - .5)
			, deltaLat = Math.random() / 80 * deltaSignLat
			, deltaSignLon = Math.sign(Math.round(Math.random()) - .5)
			, deltaLon = Math.random() / 120 * deltaSignLon
		
		return [
			((bbox[3][0] - bbox[1][0])  / 2) + bbox[1][0] + deltaLat
			, ((bbox[3][1] - bbox[1][1])  / 2) + bbox[1][1] + deltaLon
		]

	}

}

module.exports = Tweets
