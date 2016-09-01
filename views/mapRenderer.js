var d3 = require('d3')
	, mapData = require('../data/belgian-provinces')
	, debug = require('debug')('mapRenderer')

/**
* Set of functions to manage map and map content
*
* @constructor
* 
*/
function MapRenderer (svg, tweets) {

//~ console.log('pointsData', tweets)

	var pointsData = tweets || []
		, pointsLayer = svg.selectAll('circle')
		, projection = d3.geoMercator()
		  .center([5, 48.9])
		  .scale(960 * 13)
// TODO: dynamically set width and height according to page dimensions
		  .translate([1200 / 2, 890])
		  
	// bind existing circles (DOM nodes) to the corresponding tweets
	svg.selectAll('circle').data(pointsData)
	/****************************************
	* 
	* Public methods
	* 
	****************************************/

	/**
	* Render map of Belgium
	* 
	* @return {object} map SVG
	*
	*/
	this.init = function() {
		  
		var countryLayer = d3.geoPath()
			.projection(projection)
			
		var countryPath = svg.append('path')
			.attr('fill', '#eeeeee')
			.attr('stroke', '#aaaaaa')
				
		countryPath.datum(mapData)
		
		// draw the country
		countryPath.attr('d', countryLayer)
		
	}
	
	this.bindData = function(tweets) {
		
	}
	
	this.updatePoints = function(newTweet) {
		//~ console.log('updatePoints', newTweet)
		
		if (newTweet)
			pointsData.push(newTweet)
		
//~ console.log('pointsData', pointsData)
		
		svg.selectAll('circle').data(pointsData, function(d) {return d.id_str})
			.enter().append('circle')
				.attr('cx', function(d) {
					return projection(d.coordinates)[0]
				})
				.attr('cy', function(d) {
					return projection(d.coordinates)[1]
				})
				.style('fill', 'none')
				.style('stroke', '#008000')
				.attr('r', '10')
				.style('stroke-opacity', 0)
				.style('fill-opacity', 0)
				.transition()
				.style('stroke-opacity', 1)
				.transition()
				.attr('r', '2')
				.style('fill', '#008000')
				.style('stroke', 'none')
				.style('fill-opacity', .3)

	}
	this.initPoints = function() {
		
		svg.selectAll('circle').data(pointsData, function(d) {return d.id_str})
			.enter().append('circle')
				.attr('cx', function(d) {
					return projection(d.coordinates)[0]
				})
				.attr('cy', function(d) {
					return projection(d.coordinates)[1]
				})
				.attr('class', 'tweet')
				.attr('r', '2')
				.attr('fill', '#008000')
				.attr('opacity', .3)

	}
	
	return this	
}

module.exports = MapRenderer
