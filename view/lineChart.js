var d3 = require('d3')
	, Utils = require('../view/utils')
	, debug = require('debug')('lineChart')

/**
* Set of functions to manage real-time line chart (tweets counter)
*
* @constructor
* 
* @param {object} svg the d3 selection
* @param {object} granularity 'm' or 's' for minute or second
* 
*/
function LineChart (svg, granularity) {

	var self = this
		, utils = new Utils()
		, transitionDelay = 650

	if (granularity === 'm') {
		var timeRes = 60000
			, barCount = 30
			, svgWidth = 450
			, idFunc = function(d) { return d.getMinutes() }
	}
	else {
		var timeRes = 1000
			, barCount = 60
			, svgWidth = 450
			, idFunc = function(d) { return + ('' + d.getMinutes() + d.getSeconds()) }
	}
	
	var margin = {top: 20, right: 20, bottom: 80, left: 80},
		width = svgWidth - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom
		
	var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	this.bars = g.append('g')
	
	/****************************************
	* 
	* Private methods
	* 
	****************************************/
	
	/****************************************
	* 
	* slide bars as time goes on (every new minute or second, based on granularity)
	* 
	****************************************/
	function nextTimeInterval() {

		var isTabActive = utils.isTabActive()
		

		self.timeline.shift()
		
		self.timeline.push({
			id: idFunc(new Date())
			, count: 0
		})

		var rect = self.bars.selectAll('rect').data(self.timeline, function(d) {return d.id})

		rect.enter()
			.append('rect')
				.attr('x', function(d, i) { return self.x(-1)})
				.attr('y', height)
				.attr('width', width / barCount)
				.attr('height', 0)
				.style('fill', '#008000')
				.style('stroke', 'white')
				.style('stroke-width', '1')

		if(isTabActive){
			rect.transition()
				.duration(transitionDelay)
					.attr('y', function(d) { return self.y(d.count)})
					.attr('height', function(d) { return height - self.y(d.count)})
		}else{
			rect.attr('y', function(d) { return self.y(d.count)})
				.attr('height', function(d) { return height - self.y(d.count)})
		}

		if(isTabActive) {
			rect.transition()
				.duration(transitionDelay)
					.attr('x', function(d, i) { return self.x(i - barCount)})
					.style('fill', '#66B366')
		}else{
			rect.attr('x', function(d, i) { return self.x(i - barCount)})
				.style('fill', '#66B366')
		}


		
		self.yAxis.call(d3.axisLeft(self.y).tickFormat(d3.format('d')).ticks(tickCountSetter(self.maxCount)))

		if(isTabActive){
			rect.exit().transition()
				.duration(transitionDelay)
				.attr('y', height)
				.attr('height', 0)
				.attr('x', function(d, i) { return self.x(i - barCount)})
				.remove()
		}else{
		rect.exit()
			.attr('y', height)
			.attr('height', 0)
			.attr('x', function(d, i) { return self.x(i - barCount)})
			.remove()
		}


	
	}
	
	function tickCountSetter(n){
		if (n <=2)
			return n
		else
			return 6
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
	this.init = function (timeline) {
		
		this.timeline = timeline

		this.maxCount = d3.max(self.timeline, function(d) {return d.count})

		this.x = d3.scaleLinear()
			.domain([-(barCount-1), 0])
			.range([0, width])
			.nice()

		this.y = d3.scaleLinear()
			.domain([0, self.maxCount])
			.range([height, 0])
			//~ .nice()

		g.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + self.y(0) + ")")
			.call(d3.axisBottom(self.x).ticks(5))

		this.yAxis = g.append("g")
			.attr("class", "axis axis--y")
			.call(d3.axisLeft(self.y).ticks(6))
		
		this.bars.selectAll('rect').data(self.timeline, function(d) {return d.id})
			.enter()
			  .append('rect')
				.attr('x', function(d, i) { return self.x(i - barCount)})
				.attr('y', function(d) { return self.y(d.count)})
				.attr('width', width / barCount)
				.attr('height', function(d) { return height - self.y(d.count)})
				.style('fill', function(d, i) { return i === barCount-1? '#008000' : '#66B366'})
				.style('stroke', 'white')
				.style('stroke-width', '1')
				
		// launch chart refresh at every time interval
		setInterval(nextTimeInterval, timeRes)
	}
	
	/***********
	 * 
	 * Add new tweet to latest bar
	 *
	 ************/
	this.addTweet = function() {

		if (typeof this.timeline !== 'undefined') {
			var isTabActive = utils.isTabActive()
				, bars
			this.timeline[self.timeline.length-1].count++
			
			this.maxCount = d3.max(self.timeline, function(d) {return d.count})
			
			this.y.domain([0, self.maxCount])
			
			this.yAxis.call(d3.axisLeft(self.y).tickFormat(d3.format('d')).ticks(tickCountSetter(self.maxCount)))

			bars = this.bars.selectAll('rect')
			if(isTabActive){
				bars.data(self.timeline, function(d) {return d.id})
					.transition()
					.delay(transitionDelay)
					  .attr('y', function(d) { return self.y(d.count) })
					  .attr('height', function(d) { return height - self.y(d.count)})
			}else{
				bars.data(self.timeline, function(d) {return d.id})
				  .attr('y', function(d) { return self.y(d.count) })
				  .attr('height', function(d) { return height - self.y(d.count)})
			}

		}
	}



	return this	
}

module.exports = LineChart
