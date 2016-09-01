var d3 = require('d3')
	, debug = require('debug')('statsCalculator')

/**
 * Set of functions to manage map and map content
 *
 * @constructor
 *
 */
function StatsCalculator(tweetsCache) {

	var stats = {}

	/****************************************
	 *
	 * Public methods
	 *
	 ****************************************/

	/**
	 * Calculate statistics
	 *
	 * @return {object}
	 *
	 */
	this.calculate = function () {

		var stats = tweetsCache.reduce(function (counts, msg) {
			
			switch(true) {
				case msg.in_reply_to_user_id !== null:
					counts.reply++
				break
				case msg.retweeted === true:
					counts.retweet++
				break
				default:
					counts.original++
				break
				
			}
			return counts
			
		}, {
			original: 0
			, retweet: 0
			, reply: 0
			})

		stats.total = tweetsCache.length

		return stats


	}

	this.bindData = function (tweets) {

	}

}

module.exports = StatsCalculator
