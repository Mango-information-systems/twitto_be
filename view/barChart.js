var d3 = require('d3')
	, debug = require('debug')('barChart')

/**
* Set of functions to manage real-time bar chart (top hashtags - mentions)
*
* @constructor
* 
* @param {object} svg the d3 selection
* 
*/
function BarChart (svg) {

	var self = this
		, svgWidth = 450

	
	var margin = {top: 0, right: 20, bottom: 80, left: 0}
		, width = svgWidth - margin.left - margin.right
		, height = 300 - margin.top - margin.bottom
		, categoryIndent = 4 * 15 + 5
		, defaultBarWidth = 3000

	var x = d3.scaleLinear()
		.domain([0, defaultBarWidth])
		.range([0, width])

	var y = d3.scaleBand()
		.range([0, height])
		.padding(0.1)
		.round(0)

	var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")


	/****************************************
	* 
	* Private methods
	* 
	****************************************/

	/**
	 * Update statistics with data from one extra tweet
	 *
	 * @param {object} msg new tweet
	 *
	 * @private
	 *
	 */
	function updateStats(tweet) {
		var stats = []
			,result = {}
			, reorder = false
			, tempLowestCount = 0


		//if(self.allEntitiesStats.length == 0){
		//	self.redrawChart()
		//}

		// Check if hashtags or mentions
		if(tweet.has_hashtag || tweet.has_mention){
			if(self.what == 'hashtags') {
				stats = tweet.hashtags
			} else {
				stats = tweet.mentions
			}


			console.log(stats)
			console.log(tweet)
			stats.forEach(function (s) {
				reorder = false

				// Increase counter or add stat in allstats
				if(self.allEntitiesStats.hasOwnProperty(s)) {
					self.allEntitiesStats[s]++
				} else {
					self.allEntitiesStats[s] = 1
				}

				// If the current stats counter is >= than the lowestcount
				// add it in the topEntitiesStats

				console.log(s, self.topEntitiesStats.length, '||',  self.allEntitiesStats[s] , self.lowestCount)

				if(self.topEntitiesStats.length < 10 || self.allEntitiesStats[s] > self.lowestCount){
console.log('if', self.topEntitiesStats.length < 10 || self.allEntitiesStats[s] > self.lowestCount)
					self.topEntitiesStats.push({'key': s, 'value': self.allEntitiesStats[s]})
					tempLowestCount = self.topEntitiesStats.length ? self.topEntitiesStats.slice(self.topEntitiesStats.length - 1, self.topEntitiesStats.length)[0].value : 0
					console.log('tempLowestCount', tempLowestCount ,'self.lowestCount', self.lowestCount)
					if(tempLowestCount > self.lowestCount){
						reorder = true
					}
				}

			})

			console.log('reorder', reorder)
console.log('-------------')
			// Reorder
			if(reorder){

				self.topEntitiesStats.sort(function (p1, p2) {
					return p2.value - p1.value
				})
				self.topEntitiesStats = self.topEntitiesStats.slice(0, 10)
				self.lowestCount = tempLowestCount

				self.redrawChart()
				self.redrawChart()
			}

		}
	}

	/****************************************
	 *
	 * Public methods
	 *
	 ****************************************/

	/***********
	 *
	 * Render line chart
	 *
	 * @param {object} timeline time series data
	 *
	 ************/
	this.init = function (what, allEntitiesStats, topEntitiesStats, lowestCount) {
		self.allEntitiesStats = allEntitiesStats
		self.topEntitiesStats = topEntitiesStats
		self.lowestCount = lowestCount
		self.what = what

		// TODO Why oh why do I have to do this twice???
		if(topEntitiesStats.length){
			self.redrawChart()
			self.redrawChart()
		}


	}

	this.addTweet = function (tweet) {
		if(typeof self.topEntitiesStats !== 'undefined') {
			updateStats(tweet)
		}
	}

	this.redrawChart = function(){

		console.log('redraw', self.topEntitiesStats )

		//Reset domains
		y.domain(self.topEntitiesStats
			.map(function (d) {
				return d.key
			}))
		var barmax = d3.max(self.topEntitiesStats, function (e) {
			return e.value
		})
		x.domain([0, barmax])


		/////////
		//ENTER//
		/////////

		//Bind new data to chart rows

		//Create chart row and move to below the bottom of the chart
		var chartRow = g.selectAll("g.chartRow")
			.data(self.topEntitiesStats, function (d) {
				return d.key
			})

		var yposition = height + margin.top + margin.bottom;

		var newRow = chartRow
			.enter()
			.append("g")
			.attr("class", "chartRow")
			.attr("transform", "translate(0," + yposition + ")")

		//Add rectangles
		newRow.insert("rect")
			.attr("class", "bar")
			.attr("x", 0)
			.attr("opacity", 0)
			.attr("height", 40)
			.attr("width", function (d) {
				return x(d.value)
			})

		//Add value labels
		newRow.append("text")
			.attr("class", "label")
			.attr("y", y.bandwidth() / 10)
			.attr("x", 0)
			.attr("opacity", 0)
			.attr("dy", "25px")
			.attr("dx", "0.5em")
			.text(function (d) {
				return d.value
			})

		//Add Headlines
		newRow.append("text")
			.attr("class", "category")
			.attr("text-overflow", "ellipsis")
			.attr("y", y.bandwidth() / 10)
			.attr("x", categoryIndent)
			.attr("opacity", 0)
			.attr("dy", "25px")
			.attr("dx", "0.5em")
			.text(function (d) {
				return d.key
			})

		//////////
		//UPDATE//
		//////////

		//Update bar widths
		chartRow.select(".bar").transition()
			.duration(300)
			.attr("width", function (d) {
				return x(d.value)
			})
			.attr("opacity", 1)

		//Update data labels
		chartRow.select(".label").transition()
			.duration(300)
			.attr("opacity", 1)
			.text(function (d) {
				return d.value
			})
		
		chartRow.select(".category").transition()
			.duration(300)
			.attr("opacity", 1)
			.text(function (d) {
				return d.key
			})

		//Fade in categories
		chartRow.select(".category").transition()
			.duration(300)
			.attr("opacity", 1)


		////////
		//EXIT//
		////////

		//Fade out and remove exit elements
		chartRow.exit().transition()
			.style("opacity", "0")
			.attr("transform", "translate(0," + (height + margin.top + margin.bottom) + ")")
			.remove()


		////////////////
		//REORDER ROWS//
		////////////////

		chartRow.transition()
			.duration(1000)
			.attr("transform", function (d) {
				return "translate(0," + y(d.key) * 2 + ")"
			})
	}

	return this	
}

module.exports = BarChart
