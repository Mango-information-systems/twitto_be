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
	
	this.g = svg.append('g').attr('transform', 'translate(150, 150)')
	
	this.totalCount = svg.select('#totalCount')
	this.replyCount = svg.select('#replyCount')
	
	var replyArc = d3.arc()
		.innerRadius(120)
		.outerRadius(140)
		.startAngle(- tau / 4)
	
	var hashtagArc = d3.arc()
		.innerRadius(108)
		.outerRadius(118)
		.startAngle(- tau / 4)
	
	//~ var background = this.g.append('path')
		//~ .datum({endAngle: tau})
		//~ .style('fill', '#ddd')
		//~ .attr('d', arc)
	
	this.replySlice = this.g.append('path')
		.datum({endAngle: 0.001 * tau - tau / 4})
		.style('fill', '#008000')
		.attr('d', replyArc)
	
	this.hashtagSlice = this.g.append('path')
		.datum({endAngle: 0.001 * tau - tau / 4})
		.style('fill', '#008000')
		.attr('d', hashtagArc)
		
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
	function arcTween(newAngle, arc) {

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
	 * Update statistics with data from one extra tweet
	 *
	 * @param {object} msg new tweet
	 * 
	 * @private
	 * 
	 */
	function updateStats (msg) {

		if (msg.is_reply)
			self.stats.replyCount++
		
		self.stats.previousTotal = self.stats.totalCount
		
		self.stats.totalCount++

	}

	/**
	 * Update total tweets counters
	 * 
	 * @private
	 * 
	 */
	function updateTotalCount() {
		
		self.replyCount.text(self.stats.replyCount)
		self.totalCount.datum(self.stats.totalCount).transition()
		    .tween('text', textTween(self.stats.previousTotal, self.stats.totalCount))
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
		  .attrTween('d', arcTween(self.stats.replyCount / self.stats.totalCount * tau - tau / 4, replyArc))
		  
		self.hashtagSlice.transition()
		  .duration(750)
		  .attrTween('d', arcTween(self.stats.hashtagCount / self.stats.totalCount * tau - tau / 4, hashtagArc))
	}
	
	

	/****************************************
	 *
	 * Public methods
	 *
	 ****************************************/

	/**
	 * Display chart with the statistics received from the server
	 *
	 * @param {object} stats tweet statistics
	 * 
	 */
	this.init = function (stats) {

		self.stats = stats
		
		self.stats.previousTotal = 0

		updateTotalCount()
		
		updateArcs()

	}

	/**
	 * Updated counters
	 *
	 * @param {object} newTweets new tweet(s)
	 * 
	 */
	this.addTweets = function (newTweets) {

		if (typeof this.stats !== 'undefined') {
			newTweets.forEach(updateStats)

			updateTotalCount()
			
			updateArcs()

		}
	}

}

module.exports = DonutChart
