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
	* Remove all cached tweets older than 4 hours - unless all tweets are that old
	*
	* @private
	* 
	*/
	function cleanCache() {
		
		storage.getItem('tweets')
		.then(function(tweets) {
		
			var earlier = new Date(Date.now().getTime() - 4 * 60 * 60 * 1000)
		
			var res = tweets.filter(function(tweet, ix){
				return Date.parse(tweet.created_at) - earlier > 0
					
			})
		
			if (res.length > 0)
				storage.setItem('tweets', res)
		})
		
	}
	
	//~ setInterval(cleanCache, 120000)

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
