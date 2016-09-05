var debug = require('debug')('tweetsModel')

/********************************************************
* Tweets datastore
* 
* @constructor
* 
*********************************************************/
function Tweets(storage) {

	// initialize tweets storage to an empty array in case no tweets are already stored
	if (storage.keys().indexOf('tweets') === -1) {
		storage.setItemSync('tweets', [])
	}

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
		
		storage.getItem('tweets')
		.then(function(tweets) {
		
			console.log('before cache clean', tweets.length)
			var yesterday = new Date().getDate() - 1
		
			var res = tweets.filter(function(tweet, ix){
				
				return Date.parse(tweet.created_at) > yesterday
					
			})
		
			console.log('after cache clean', res.length)
		
			storage.setItem('tweets', res)
		})
		
	}
	
	// clean the cache every hour
	setInterval(cleanCache, 60 * 60 * 1000)

	/********************************************************
	* 
	* Public functions
	* 
	*********************************************************/

	this.add = function(tweet) {
		//~ console.log('adding tweet', tweet)
		storage.getItem('tweets')
		  .then(function(tweets) {
			storage.setItem('tweets', tweets.concat(tweet))
		  })
	}

	this.getAll = function(callback) {
		storage.getItem('tweets')
		  .then(function(tweets) {
			callback(tweets)
		  })
	}

}

module.exports = Tweets
