const events = require('events')
	, util = require('util')
	, storage = require('node-persist')
	, path = require('path')
	, tweetsModel = require('./tweets')

/********************************************************
* App in-memory and persisted datastore
* 
* @constructor
* 
*********************************************************/
function Model(searchHashtags) {

	let self = this
	this.storage = storage
	
	// event emitter
	events.EventEmitter.call(this)
	
	this.tweets = new tweetsModel(this, searchHashtags)


	async function initStorage() {
		
		await storage.init({
			dir: path.resolve(__dirname + '/../persist') 
			, ttl: true // 24h
		})
		
		self.tweets.loadPersisted()
	}

	initStorage()
}

util.inherits(Model, events.EventEmitter)

module.exports = Model

