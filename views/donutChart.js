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
function DonutChart(svg) {

	var self = this
		, tau = 2 * Math.PI
	
	this.stats = {
		previousTotal: 0
		, reply: 0
		, total: 0
	}
	
	this.g = svg.append('g').attr('transform', 'translate(150, 150)')
	
	this.totalCount = svg.select('#totalCount')
	
	var arc = d3.arc()
		.innerRadius(120)
		.outerRadius(150)
		.startAngle(0)
	
	var background = this.g.append('path')
		.datum({endAngle: tau})
		.style('fill', '#ddd')
		.attr('d', arc)
	
	this.replySlice = this.g.append('path')
		.datum({endAngle: 0.001 * tau})
		.style('fill', '#008000')
		.attr('d', arc)
		
	/****************************************
	 *
	 * Private methods
	 *
	 ****************************************/
	 
	
	/**
	 * Returns a tween for a transition’s "d" attribute, transitioning any selected
	 * arcs from their current angle to the specified new angle.
	 * 
	 * As seen in http://bl.ocks.org/mbostock/5100636
	 *
	 * @param {number} newAngle
	 * 
	 * @return {function} tween function
	 * 
	 * @private
	 * 
	 */
	function arcTween(newAngle) {

		return function(d) {

			var interpolate = d3.interpolate(d.endAngle, newAngle)

			return function(t) {
				d.endAngle = interpolate(t)
				return arc(d)
			}
		}
	}
	
	/**
	 * Returns a tween for a transition’s "text" attribute, transitioning any selected
	 * text from their current value to the specified new value.
	 * 
	 * @param {number} oldValue
	 * @param {number} newValue
	 * 
	 * @return {function} tween function
	 * 
	 * @private
	 * 
	 */
	function textTween(oldValue, newValue) {

		return function(d) {

			var interpolate = d3.interpolate(oldValue, newValue)

			return function(t) {
				self.totalCount.text(Math.floor(interpolate(t)))
			}
		}
	}
	
	/**
	 * Update counters with one extra tweet
	 *
	 * @param {object} msg new tweet
	 * 
	 * @private
	 * 
	 */
	function updateStats (msg) {


		if (msg.in_reply_to_user_id !== null)
			self.stats.reply++
		
		self.stats.previousTotal = self.stats.total
		
		self.stats.total++

	}

	/**
	 * Update total tweets counters
	 * 
	 * @private
	 * 
	 */
	function updateTotalCount() {
		//~ self.totalCount.text(self.stats.total)
		self.totalCount.datum(self.stats.total).transition()
		    .tween('text', textTween(self.stats.previousTotal, self.stats.total))
	}
	
	/**
	 * Update mentions counts arc
	 * 
	 * @private
	 * 
	 */
	function updateArcs() {
		
		
		self.replySlice.transition()
		  .duration(750)
		  .attrTween('d', arcTween(self.stats.reply / self.stats.total * tau))
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

		updateTotalCount()
		
		updateArcs()

	}

}

module.exports = DonutChart
