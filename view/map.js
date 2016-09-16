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
	
	this.projection = d3.geoMercator()
		  .center([5, 48.9])
		  .scale(960 * 13)
// TODO: dynamically set width and height according to page dimensions
		  .translate([1200 / 2, 890])
	
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
			  .attr('cx', function(d) { d.cx = Math.random() * 630; return 480 + Math.sign(Math.round(Math.random()) - .5) *d.cx})
			  .attr('cy', function(d) { return 400 + Math.sign(Math.round(Math.random()) - .5) * Math.sqrt(630 * 630 - d.cx * d.cx)})
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

	this.renderMap = function(){

		var containerSize = this.container.node().getBoundingClientRect()

		var canvas
			, context
			, path
			, projection
			// TODO: update width and height on resize
			, width = containerSize.width
			, height = containerSize.width / 1.348

		projection = d3.geoMercator()
			.center([5, 48.9])
			.scale(width * 13)
			.translate([width * 1.25 / 2, height * 1.25])

		canvas = this.container.append('canvas').attr('height', height).attr('width', width)

		context = canvas.node().getContext('2d')
		path = d3.geoPath().projection(projection).context(context)

		d3.json('/data/belgian-provinces.json', function (error, belgianProvinces) {
			context.beginPath()
			path(belgianProvinces)
			context.fillStyle = '#eeeeee'
			context.fill()
			context.lineWidth = '1'
			context.strokeStyle = '#bbbbbb'
			return context.stroke()
		})
	}
	
	return this	
}

module.exports = Map
