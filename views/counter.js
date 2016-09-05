var d3 = require('d3')
	, debug = require('debug')('counter')

/**
* Set of functions to manage real-time tweet counters
*
* @constructor
* 
* @param {object} svg the d3 selection
* 
*/
function Counter(svg) {

	var self = this
	
	this.stats = {
		original: 0
		, reply: 0
		, total: 0
	}
	this.svg = svg
	
	this.totalTweetsLabel = svg.select('#total-tweets .label')
	this.totalTweetsProgress = svg.select('#total-tweets progress')
	this.originalTweetsLabel = svg.select('#original-tweets .label')
	this.originalTweetsProgress = svg.select('#original-tweets progress')
	this.repliesLabel = svg.select('#replies .label')
	this.repliesProgress = svg.select('#replies progress')
	
	/****************************************
	 *
	 * Private methods
	 *
	 ****************************************/

	/**
	 * Update counters with one extra tweet
	 *
	 * @param {object} msg new tweet
	 * 
	 * @private
	 * 
	 */
	function updateStats (msg) {

		switch (true) {
			case msg.in_reply_to_user_id !== null:
				self.stats.reply++
				break
			default:
				self.stats.original++
				break
		}

		self.stats.total++

	}

	/****************************************
	 *
	 * Public methods
	 *
	 ****************************************/

	/**
	 * Updated counters
	 *
	 * @param {object} newTweets new tweet(s)
	 * 
	 */
	this.addTweets = function (newTweets) {

		newTweets.forEach(updateStats)

		this.renderProgressBars(this.totalTweetsLabel, this.totalTweetsProgress, this.stats.total, this.stats.total)

		// The first time we start the app
		// We could run the update progressbars all the time, for all 4 of them to simplify the code
		// But I didnt want to do unecessary updates on the client
		if(Object.keys(newTweets).length === 0) {

			this.renderProgressBars(this.originalTweetsLabel, this.originalTweetsProgress, this.stats.original, this.stats.total)
			this.renderProgressBars(this.repliesLabel, this.repliesProgress, this.stats.reply, this.stats.total)
		} else {
			this.renderProgressBars(this.repliesLabel, this.repliesProgress, this.stats.reply, this.stats.total)
			this.renderProgressBars(this.originalTweetsLabel, this.originalTweetsProgress, this.stats.original, this.stats.total)
		}


	}

	this.renderProgressBars = function ($label, $progressBar, value, total) {
		$label.html(value)

		// Avoid division by zero NaN
		//~ if(total !== 0) {
//~ 
			//~ $progressBar
				//~ .transition()
				//~ .delay(function (d, i) {
					//~ return i * 200
				//~ })
				//~ .duration(1000)
				//~ .attr('value', (value * 100) / total)
		//~ }

	}

}

module.exports = Counter
