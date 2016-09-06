var d3 = require('d3')
	, mapData = require('../data/belgian-provinces')
	, debug = require('debug')('map')

/**
* Set of functions to manage map and map content
*
* @constructor
* 
*/
function Map (svg) {

	var self = this
	
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
			.enter().append('circle')
			  .attr('cx', function(d) {
			  	return self.projection(d.twitto.coordinates)[0]
			  })
			  .attr('cy', function(d) {
			  	return self.projection(d.twitto.coordinates)[1]
			  })
			  .style('fill', 'none')
			  .style('stroke', '#008000')
			  .attr('r', '10')
			  .style('stroke-opacity', 0)
			  .style('fill-opacity', 0)
			  .transition()
			  .delay(function(d, i) { 
				   return count === 1? 400 : 100 + i / tweets.length * transitionDuration })
			  .duration(transitionDuration)
			    .style('stroke-opacity', 1)
			    .style('stroke-width', 5)
			  .transition()
			    .attr('r', '4')
			    .style('fill', '#008000')
			    .style('stroke', 'none')
			    .style('fill-opacity', .3)

	}
	
	return this	
}

module.exports = Map
