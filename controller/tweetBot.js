var params = require('../params')
	, debug = require('debug')('tweetBot')

var tweetBot = new TweetBot()
/**
 * Set of functions to process auto tweets
 *
 *
 * @constructor
 *
 */
function TweetBot() {

	var self = this


	/****************************************
	 *
	 * private methods
	 *
	 ****************************************/

	/**
	 * monitor tweets geolocated in Belgium, using twitter's streaming API
	 *
	 * @private
	 *
	 */
	function listeners() {
		process.on('message', function (msg) {
			console.log(msg)
		})
	}

	debug('starting tweetBot')
	listeners()
}
