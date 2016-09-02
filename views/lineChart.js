var d3 = require('d3')
	, debug = require('debug')('lineChart')

/**
* Set of functions to manage real-time line chart (tweets counter)
*
* @constructor
* 
*/
function LineChart (svg, tweets) {

	/****************************************
	* 
	* Public methods
	* 
	****************************************/

	var self = this

	var ts = Date.now()
		, recentTweets = tweets.filter(function(tweet) {
			return ts - new Date(tweet.created_at) < 30 * 60000
		})
		
	 // initialize countStruct array init based on http://stackoverflow.com/a/13735425/1006854
	var countStruct = Array.apply(null, Array(30)).map(function(d, i) {
		return {
			id: new Date(ts - (29-i) * 60000).getMinutes()
			, count: 0
		}
	})
		

	countByMinute = recentTweets.reduce(function(memo, tweet){
		var howLongAgo = Math.floor((ts - new Date(tweet.created_at)) / 60000)
		
		memo[29 - howLongAgo].count += 1

		return memo
		
	}, countStruct)

	var maxCount = d3.max(countByMinute, function(d) {return d.count})

	//~ console.log('countByMinute', countByMinute)

	/***********
	* Render line chart
	*
	************/

	var margin = {top: 20, right: 20, bottom: 80, left: 40},
		width = 600 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom
	
	this.g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

	var x = d3.scaleLinear()
		.domain([-29, 0])
		.range([0, width])
		.nice()

	var y = d3.scaleLinear()
		.domain([0, maxCount])
		.range([height, 0])
		//~ .nice()

	this.g.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + y(0) + ")")
		.call(d3.axisBottom(x).ticks(5))

	var yAxis = this.g.append("g")
		.attr("class", "axis axis--y")
		.call(d3.axisLeft(y).ticks(6))
	
	var bars = this.g.append('g')
	
	bars.selectAll('rect').data(countByMinute, function(d) {return d.id})
		.enter()
		.append('rect')
			.attr('x', function(d, i) { return x(i - 30)})
			.attr('y', function(d) { return y(d.count)})
			.attr('width', width / 30)
			.attr('height', function(d) { return height - y(d.count)})
			.style('fill', function(d, i) { return i === 29? '#008000' : '#66B366'})
			.style('stroke', 'white')
			.style('stroke-width', '1')
	
	function nextMinute() {
console.log('nextMinute')
		countByMinute.shift()
		
		countByMinute.push({
				id: new Date().getMinutes()
				, count: 0
			})

		 var rect = bars.selectAll('rect').data(countByMinute, function(d) {return d.id})

		 rect.enter()
			.append('rect')
				.attr('x', function(d, i) { console.log('adding record', d.id); return x(-1)})
				.attr('y', height)
				.attr('width', width / 30)
				.attr('height', function(d) { return height - y(d.count)})
				.style('fill', '#008000')
				.style('stroke', 'white')
				.style('stroke-width', '1')
			.transition()
				.duration(650)
				.attr('y', function(d) { return y(d.count)})

		 rect.transition()
			.duration(650)
				.attr('x', function(d, i) { return x(i - 30)})
				.style('fill', '#66B366')
		
		 rect.exit().transition()
			.duration(650)
			.attr('y', height)
			.attr('height', 0)
			.attr('x', function(d, i) { return x(i - 30)})
			.remove()
	
	}
	
	setInterval(nextMinute, 60000)
	
	this.addTweet = function() {
		
		countByMinute[countByMinute.length-1].count++
		
		maxCount = d3.max(countByMinute, function(d) {return d.count})
		
		y.domain([0, maxCount])
		
		yAxis.call(d3.axisLeft(y))
		
		bars.selectAll('rect').data(countByMinute, function(d) {return d.id})
			.transition()
				.attr('y', function(d) {return y(d.count)})
				.attr('height', function(d) { return height - y(d.count)})
	}



	return this	
}

module.exports = LineChart
