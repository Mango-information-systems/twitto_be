var tweetsModel = require('./tweets')

/********************************************************
* App datastore
* 
* In-memory storage
* 
* @constructor
* 
*********************************************************/
function Storage(app) {

	var self = this

	this.tweets = new tweetsModel()

}

module.exports = Storage
