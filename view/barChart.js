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
		.range([0, height * 2])
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
	function updateStats(entities) {
		var result = {}
			, tempLowestCount = 0

			//~ console.log('entities', entities)

			// increment statistics, and 
			entities.forEach(function (entity) {

				// Increase counter or add stat in allstats
				if(self.allEntitiesStats.hasOwnProperty(entity))
					self.allEntitiesStats[entity]++
				else
					self.allEntitiesStats[entity] = 1

				// If the current entities counter is >= than the lowestcount
				// update its value inside topEntitiesStats, or add it inside topEntitiesStats

				if(self.topEntitiesStats.length < 10 || self.allEntitiesStats[entity] > self.lowestCount) {

					var alreadyExists = false
					
					// increment value in the top10
					self.topEntitiesStats.forEach(function(stats, ix) {

						if (stats.key === entity) {
							self.topEntitiesStats[ix].value = self.allEntitiesStats[entity]
							alreadyExists = true
						}
					})
					
					// new entity to add to the top10
					if (!alreadyExists)
						self.topEntitiesStats.push({'key': entity, 'value': self.allEntitiesStats[entity]})
					
					tempLowestCount = self.topEntitiesStats.length ? self.topEntitiesStats[self.topEntitiesStats.length - 1].value : 0
					
					//~ console.log('tempLowestCount', tempLowestCount ,'self.lowestCount', self.lowestCount)
				}

			})

			// Reorder top stats records based on value, then key for records having equal values
			self.topEntitiesStats.sort(function (p1, p2) {
				return p2.value !== p1.value ? p2.value - p1.value : p2.key.toLowerCase() < p1.key.toLowerCase()
			})
			
			self.topEntitiesStats = self.topEntitiesStats.slice(0, 10)
			
			self.lowestCount = tempLowestCount

			self.redrawChart()
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
	this.init = function (entityType, allEntitiesStats, topEntitiesStats, lowestCount) {
		self.allEntitiesStats = allEntitiesStats
		self.topEntitiesStats = topEntitiesStats
		self.lowestCount = lowestCount

		self.prefix = entityType === 'hashtags' ? '#' : '@'

		if(topEntitiesStats.length){
			self.redrawChart()
		}


	}

	this.addTweet = function (entities) {
		if(typeof self.topEntitiesStats !== 'undefined') {
			updateStats(entities)
		}
	}

	this.redrawChart = function(){

		//~ console.log('redraw', self.topEntitiesStats )

		//Reset domains
		y.domain(d3.range(self.topEntitiesStats.length))
		
		var barmax = d3.max(self.topEntitiesStats, function (e) {
			return e.value
		})
		x.domain([0, barmax])


		/////////
		//ENTER//
		/////////

		//Bind new data to chart rows

		//Create chart row and move to below the bottom of the chart
		var chartRow = g.selectAll('g.chartRow')
			.data(self.topEntitiesStats, function (d) {
				return d.key
			})

		var yposition = height + margin.top + margin.bottom;

		var newRow = chartRow
			.enter()
			.append('g')
			.attr('class', 'chartRow')
			.attr('transform', function (d, i) {
				return 'translate(0,' + y(i) + ')'
			})

		//Add rectangles
		newRow.insert('rect')
			.attr('class', 'bar')
			.attr('x', 0)
			.attr('opacity', 0)
			.attr('height', 40)
			.transition()
			.duration(300)
			.attr('width', function (d) {
				return x(d.value)
			})
			.attr('opacity', 1)

		//Add value labels
		newRow.append('text')
			.attr('class', 'label')
			.attr('y', y.bandwidth() / 10)
			.attr('x', 0)
			.attr('opacity', 0)
			.attr('dy', '.9em')
			.attr('dx', '2.2em')
			.text(function (d) {
				return d.value
			}).transition()
			.duration(300)
			.attr('opacity', 1)

		//Add Headlines
		newRow.append('text')
			.attr('class', 'category')
			.attr('text-overflow', 'ellipsis')
			.attr('y', y.bandwidth() / 10)
			.attr('x', categoryIndent)
			.attr('opacity', 0)
			.attr('dy', '.9em')
			.attr('dx', '.5em')
			.text(function (d) {
				return self.prefix + d.key
			}).transition()
			.duration(300)
			.attr('opacity', 1)

		//Update bar widths
		chartRow.select(".bar").transition()
			.duration(300)
			.attr("width", function (d) {
				return x(d.value)
			})

		//Update data labels
		chartRow.select(".label").transition()
			.duration(300)
			.text(function (d) {
				return d.value
		})
		////////////////
		//REORDER ROWS//
		////////////////

		chartRow.transition()
			.duration(1000)
			.attr('transform', function (d, i) {
				//~ console.log('reordering', d.key, i, y(i))
				return 'translate(0,' + y(i) + ')'
			})

		////////
		//EXIT//
		////////

		//Fade out and remove exit elements
		chartRow.exit().transition()
			.attr('y', '400')
			.style('opacity', '0')
			.attr('transform', 'translate(0,' + (height + margin.top + margin.bottom) + ')')
			.remove()


	}

	return this	
}

module.exports = BarChart
