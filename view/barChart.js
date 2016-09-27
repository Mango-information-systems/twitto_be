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
	this.init = function (topEntitiesStats, lowestCount) {
		self.topEntitiesStats = topEntitiesStats
		self.lowestCount = lowestCount

		console.log(topEntitiesStats, lowestCount)

		setInterval(function () {
			self.redrawChart()
		}, 3000);
	}

	this.redrawChart = function(){

		//Reset domains
		y.domain(self.topEntitiesStats.sort(function (a, b) {
				return b.value - a.value
			})
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
			.attr("height", y.bandwidth() * 2)
			.attr("width", function (d) {
				return x(d.value)
			})

		//Add value labels
		newRow.append("text")
			.attr("class", "label")
			.attr("y", y.bandwidth() / 2)
			.attr("x", 0)
			.attr("opacity", 0)
			.attr("dy", ".35em")
			.attr("dx", "0.5em")
			.text(function (d) {
				return d.value
			})

		//Add Headlines
		newRow.append("text")
			.attr("class", "category")
			.attr("text-overflow", "ellipsis")
			.attr("y", y.bandwidth() / 2)
			.attr("x", categoryIndent)
			.attr("opacity", 0)
			.attr("dy", ".35em")
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
			.tween("text", function (d) {
				var i = d3.interpolate(+this.textContent.replace(/\,/g, ''), +d.value)
				return function (t) {
					this.textContent = Math.round(i(t))
				}
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

		var delay = function (d, i) {
			return 200 + i * 30
		}

		chartRow.transition()
			.delay(delay)
			.duration(900)
			.attr("transform", function (d) {
				return "translate(0," + y(d.key) * 2 + ")"
			})


	}

	return this	
}

module.exports = BarChart
