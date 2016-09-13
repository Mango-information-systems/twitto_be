var d3 = require('d3')
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
			.enter()
			  .append('circle')
			  .attr('r', '8')
			  .attr('cx', '-4')
			  .attr('cy', '-4')
			  .style('fill', '#008000')
			  .style('fill-opacity', .3)
			  .transition()
			  .delay(function(d, i) { 
			    return count === 1? 400 : 100 + i / tweets.length * transitionDuration
			  })
			    .attr('cx', function(d) {
			    	return self.projection(d.twitto.coordinates)[0]
			    })
			    .attr('cy', function(d) {
			    	return self.projection(d.twitto.coordinates)[1]
			    })
				.attr('r', '4')

	}
	
	return this	
}

module.exports = Map
