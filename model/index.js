var storage = require('node-persist')
	, path = require('path')
	, tweetsModel = require('./tweets')

/********************************************************
* App datastore
* 
* @constructor
* 
*********************************************************/
function Storage() {

	storage.init({
		dir: path.resolve(__dirname + '/../persist')
	})
	
	this.tweets = new tweetsModel(storage)

}

module.exports = Storage
