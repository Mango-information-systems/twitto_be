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
	
	var margin = {top: 20, right: 20, bottom: 80, left: 80}
		, width = svgWidth - margin.left - margin.right
		, height = 300 - margin.top - margin.bottom
		, categoryIndent = 4 * 15 + 5
		, defaultBarWidth = 2000

	var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	this.bars = g.append('g')
	
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
	this.init = function () {
		console.log(svg)
	}

	return this	
}

module.exports = BarChart
