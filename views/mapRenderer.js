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

	var pointsData = tweets || []
		, pointsLayer = svg.selectAll('circle')
		, projection = d3.geoMercator()
		  .center([5, 48.9])
		  .scale(960 * 6)
// TODO: dynamically set width and height according to chart dimensions
		  .translate([960 / 2, 500])
		  
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
			.attr('fill', '#dddddd')
			.attr('stroke', '#666666')
				
		countryPath.datum(mapData)
		
		// draw the country
		countryPath.attr('d', countryLayer)
		
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
				.attr('fill', '#B9EBB9')
				.attr('r', '0')
				.attr('class', 'tweet')
				.attr('opacity', 0)
				.transition()
				.attr('r', '2')
				.attr('fill', '#008000')
				.attr('opacity', .3)

	}
	
	return this	
}

module.exports = MapRenderer
