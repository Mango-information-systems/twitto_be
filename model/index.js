var storage = require('node-persist')
	, path = require('path')
	, tweetsModel = require('./tweets')

/********************************************************
* App datastore
* 
* @constructor
* 
*********************************************************/
function Storage(app) {

	var self = this

	storage.initSync({
		dir: path.resolve(__dirname + '/../persist')
	})

	this.tweets = new tweetsModel(storage)
	
	this.cache = {
		svgMap: null
		, tweets: null
	}


	// refresh pre-rendered svg and tweets cache
	this.updateCache = function (callback) {
		
		self.tweets.getAll(function(tweets) {
			self.cache.tweets = tweets
			self.cache.svgMap = app.controller.serverMap.generate(tweets)
			if (callback)
				callback()
		})
		
	}
	
	setInterval(this.updateCache, 120000)
	//~ , 3000)
}

module.exports = Storage
