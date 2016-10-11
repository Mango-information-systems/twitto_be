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
	this.render = function (entityType, topEntitiesStats) {

		self.prefix = entityType === 'hashtags' ? '#' : '@'

		//Reset domains
		y.domain(d3.range(topEntitiesStats.length))
		
		var barmax = d3.max(topEntitiesStats, function (e) {
			return e.value
		})
		x.domain([0, barmax])


		/////////
		//ENTER//
		/////////

		//Bind new data to chart rows

		//Create chart row and move to below the bottom of the chart
		var chartRow = g.selectAll('g.chartRow')
			.data(topEntitiesStats, function (d) {
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
			.attr('x', '2.4em')
			.attr('y', y.bandwidth() / 10)
			.attr('opacity', 0)
			.attr('dy', '.9em')
			.text(function (d) {
				return d.value
			}).transition()
			.duration(300)
			.attr('opacity', 1)

		//Add Headlines
		newRow.append('text')
			.attr('class', 'category')
			.attr('text-overflow', 'ellipsis')
			.attr('x', function(d, i) {
				switch(true) {
					case i > 2:
						return '2.8em'
					break
					case i === 2:
						return '2.4em'
					break
					case i === 1:
						return '2.2em'
					break
					case i === 0:
						return '1.8em'
					break
				}
			})
			.attr('y', y.bandwidth() / 10)
			.attr('opacity', 0)
			.attr('dy', function(d, i) {return i ===0 ? '.75em' : '.9em'})
			.style('font-weight', function(d, i) {return i < 3 ? '600' : '400'})
			.style('font-size', function(d, i) {
				switch(true) {
					case i > 2:
						return '1.6em'
					break
					case i === 2:
						return '1.8em'
					break
					case i === 1:
						return '2em'
					break
					case i === 0:
						return '2.4em'
					break
				}
			})
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
