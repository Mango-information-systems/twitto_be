var d3 = require('d3')
	, _ = require('underscore')
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

		var statsCalculation = _.countBy(tweetsCache, function (msg) {
			// Original tweets, in_reply_to_user_id is null, retweeted is false
			if(msg.in_reply_to_user_id == null && msg.retweeted == false) {
				return 'original'
			}
		})

		stats = {
			total: tweetsCache.length
			, original: statsCalculation.original
			, retweets: 0
			, replies: 0
		}

		return stats


	}

	this.bindData = function (tweets) {

	}

}

module.exports = StatsCalculator
