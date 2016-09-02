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

		var _this = this
			, stats = tweetsCache.reduce(function (counts, msg) {

			_this.increment(counts, msg)
			return counts

		}, {
			original: 0
			, retweet: 0
			, reply: 0
			, total: 0
		})

		return stats


	}

	this.increment = function (counts, msg) {

		switch (true) {
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

		if(counts.total == 0) {
			counts.total = tweetsCache.length
		} else {
			counts.total++
		}

		return counts

	}

	this.render = function (stats, msg) {
		var $statsTotalTweetsLabel = d3.select('#stats .total-tweets .label')
			, $statsTotalTweetsProgress = d3.select('#stats .total-tweets progress')
			, $statsOriginalTweetsLabel = d3.select('#stats .original-tweets .label')
			, $statsOriginalTweetsProgress = d3.select('#stats .original-tweets progress')
			, $statsRetweetsLabel = d3.select('#stats .retweets .label')
			, $statsRetweetsProgress = d3.select('#stats .retweets progress')
			, $statsRepliesLabel = d3.select('#stats .replies .label')
			, $statsRepliesProgress = d3.select('#stats .replies progress')

		this.renderProgressBars($statsTotalTweetsLabel, $statsTotalTweetsProgress, stats.total, stats.total)

		// The first time we start the app
		// We could run the update progressbars all the time, for all 4 of them to simplify the code
		// But I didnt want to do unecessary updates on the client
		if(Object.keys(msg).length == 0) {

			this.renderProgressBars($statsOriginalTweetsLabel, $statsOriginalTweetsProgress, stats.original, stats.total)
			this.renderProgressBars($statsRetweetsLabel, $statsRetweetsProgress, stats.retweet, stats.total)
			this.renderProgressBars($statsRepliesLabel, $statsRepliesProgress, stats.reply, stats.total)
		} else {
			switch (true) {
				case msg.in_reply_to_user_id !== null:
					this.renderProgressBars($statsRepliesLabel, $statsRepliesProgress, stats.reply, stats.total)
					break
				case msg.retweeted === true:
					this.renderProgressBars($statsRetweetsLabel, $statsRetweetsProgress, stats.retweet, stats.total)
					break
				default:
					this.renderProgressBars($statsOriginalTweetsLabel, $statsOriginalTweetsProgress, stats.original, stats.total)
					break
			}
		}


	}

	this.renderProgressBars = function ($label, $progressBar, value, total) {
		$label.html(value)

		// Avoid division by zero NaN
		if(total !== 0) {

			$progressBar
				.transition()
				.delay(function (d, i) {
					return i * 200
				})
				.duration(1000)
				.attr('value', (value * 100) / total)
		}

	}

	this.bindData = function (tweets) {

	}

}

module.exports = StatsCalculator
