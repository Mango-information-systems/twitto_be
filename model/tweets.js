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
		
		// schedule next execution in an hour
		setTimeout(cleanCache, delay)
		
		console.log('before cache clean', self.tweets.length)
		
		var yesterday = new Date().getDate() - 1
	
		self.tweets = self.tweets.filter(function(tweet, ix){
			
			return new Date(Date.parse(tweet.created_at)) > yesterday
				
		})
	
		console.log('after cache clean', self.tweets.length)
	
		storage.setItem('tweets', self.tweets)
	
		
	}
	
	// initiate a cache cleanup at the next round hour
	// based on http://stackoverflow.com/a/19847644/1006854
	var now = new Date()
		, delay = 60 * 60 * 1000

	setTimeout(cleanCache, delay - (now.getMinutes() * 60 + now.getSeconds()) * 1000 + now.getMilliseconds())

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
