const events = require('events')
	, util = require('util')
	, tweetsModel = require('./tweets')

/********************************************************
* App datastore
* 
* In-memory storage
* 
* @constructor
* 
*********************************************************/
function Model() {

	// event emitter
	events.EventEmitter.call(this)
	
	this.tweets = new tweetsModel(this)

}

util.inherits(Model, events.EventEmitter)

module.exports = Model

