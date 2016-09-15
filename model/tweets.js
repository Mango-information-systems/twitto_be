var debug = require('debug')('tweetsModel')

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
	//~ setInterval(cleanCache, 60 * 60 * 1000)

	/********************************************************
	* 
	* Public functions
	* 
	*********************************************************/

	this.add = function(tweet) {
		//~ console.log('adding tweet', tweet)
		self.tweets.push(tweet)
		
		storage.setItem('tweets', self.tweets)
		
	}

	this.getAll = function() {
		return self.tweets
	}

}

module.exports = Tweets
