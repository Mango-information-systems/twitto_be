var storage = require('node-persist')
	, path = require('path')
	, tweetsModel = require('./tweets')

/********************************************************
* App datastore
* 
* node-persist is used as a background persistence layer. It is to be used following this pattern:
* 
* * read only during server startup, to populate node.js variables caching the data (i.e. do not read at each client request)
* * save a copy of the data, alongside with update of the data cache variables
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

}

module.exports = Storage
