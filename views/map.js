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
	
	this.data = []
	
	var pointsLayer = svg.selectAll('circle')
		, projection = d3.geoMercator()
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
	* @param {object} newTweets array of tweets to be displayed in the map
	* 
	****************************************/
	this.addPoints = function(newTweets) {
		debug('addPoints', newTweets)

		newTweets = newTweets.filter(function(tweet) {
			return typeof tweet.twitto.coordinates !== 'undefined'
		})
		
		this.data = this.data.concat(newTweets)
		
//~ console.log('tweets', this.data.length)
		
		svg.selectAll('circle').data(this.data, function(d) {return d.id_str})
			.enter().append('circle')
				.attr('cx', function(d) {
					return projection(d.twitto.coordinates)[0]
				})
				.attr('cy', function(d) {
					return projection(d.twitto.coordinates)[1]
				})
				.style('fill', 'none')
				.style('stroke', '#008000')
				.attr('r', '10')
				.style('stroke-opacity', 0)
				.style('fill-opacity', 0)
				.transition()
				.delay(function(d, i) { return 100 + i / self.data.length * 1500 })
				.duration(1500)
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
