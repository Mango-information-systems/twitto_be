var d3 = require('d3')
	, mapData = require('../data/belgian-provinces')
	, debug = require('debug')('mapRenderer')

/**
* Draw the map
*
* @constructor
* 
*/
function MapRenderer (svg) {

	var pointsData = []
		, pointsLayer
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
		
		// add tweet points layer
		pointsLayer = svg.append('g').selectAll('.tweet')
		
	}
	
	this.updatePoints = function(newCoordinates) {
		//~ console.log('updatePoint', newCoordinates)
		pointsData.push([newCoordinates[0], newCoordinates[1]])
		
		pointsLayer.data(pointsData)
			.enter()
			.append('circle')
			.attr('cx', function(d) {
				return projection(d)[0]
			})
			.attr('cy', function(d) {
				return projection(d)[1]
			})
			.attr('fill', '#008000')
			.attr('r', '1.5')
			.attr('class', 'tweet')
			.attr('opacity', 0)
			.transition()
			.attr('opacity', .2)
		//~ 
		//~ // add tweet points layer
		//~ pointsLayer = d3.geoPath()
			//~ .projection(projection)
			//~ 
		//~ pointsPath.attr('d', pointsLayer)
		
	}
	
	/****************************************
	* 
	* Event listeners
	* 
	****************************************/
	
	return this	
}

module.exports = MapRenderer
