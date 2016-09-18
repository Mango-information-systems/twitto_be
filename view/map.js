var d3 = require('d3')
	, debug = require('debug')('map')

/**
* Set of functions to manage map and map content
*
* @constructor
* 
*/
function Map (container) {

	var self = this
	
	this.container = container
	
	var containerSize = this.container.node().getBoundingClientRect()
	
	// TODO: update width and height on resize
	this.width = containerSize.width
	this.height = containerSize.width / 1.348

	this.projection = d3.geoMercator()
		.center([5, 48.9])
		.scale(this.width * 13)
		.translate([this.width * 1.25 / 2, this.height * 1.25])
	
	// render the map background
	var canvas
		, context
		, path

	canvas = this.container.append('canvas').attr('height', this.height).attr('width', this.width)

	context = canvas.node().getContext('2d')
	
	path = d3.geoPath().projection(this.projection).context(context)

	d3.json('/data/belgian-provinces.json', function (error, belgianProvinces) {
		
		context.beginPath()
		path(belgianProvinces)
		
		context.fillStyle = '#eeeeee'
		context.fill()

		context.lineWidth = '1'
		context.strokeStyle = '#bbbbbb'
		context.stroke()
		
	})
	
	/****************************************
	* 
	* Public methods
	* 
	****************************************/
	
	/****************************************
	* 
	* addPoints displays geo-located tweets in the map
	* 
	* @param {object} tweets array of tweets to be displayed in the map
	* @param {number} count the number of points to be added 
	* 
	****************************************/
	this.addPoints = function(tweets, count) {
		debug('addPoints', tweets.length)

		var transitionDuration = Math.min(Math.max(tweets.length, 400), 2500)
		
		svg.selectAll('circle').data(tweets, function(d) {return d.id_str})
			.enter()
			  .append('circle')
			  .attr('r', '8')
			  .attr('cx', '-4')
			  .attr('cy', '-4')
			  .style('fill', '#008000')
			  .style('fill-opacity', .3)
			  .transition()
			  .duration(400)
			  .delay(function(d, i) { 
			    return count === 1? 0 : 100 + i / tweets.length * transitionDuration
			  })
			    .attr('cx', function(d) {
			    	return self.projection(d.coordinates)[0]
			    })
			    .attr('cy', function(d) {
			    	return self.projection(d.coordinates)[1]
			    })
				.attr('r', '4')

	}

	return this	
}

module.exports = Map
