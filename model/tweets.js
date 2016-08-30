var debug = require('debug')('tweetsModel')
	, storage = require('node-persist')


/********************************************************
* Tweets datastore
* 
* @constructor
* 
*********************************************************/
function Tweets(storage) {

	//~ storage.getItem('tweets')
	  //~ .then(function(value) {
		//~ if (typeof value === 'undefined') {
			//~ console.log('reseting cache')
			//~ storage.setItem('tweets', [])
		//~ }
	  //~ })

	/********************************************************
	* 
	* Private functions
	* 
	*********************************************************/


	/**
	* 
	* Remove all cached tweets older than 4 hours - unless all tweets are that old
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
