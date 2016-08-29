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

	var points = {type: "MultiPoint", coordinates: []}
		, pointsLayer
		, pointsPath
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
				
		countryPath.datum(mapData)
		
		// draw the country
		countryPath.attr('d', countryLayer)
		
		// add tweet points layer
		var pointsLayer = d3.geoPath()
			.projection(projection)
			
		pointsPath = svg.append('path')
		
	}
	
	this.updatePoints = function(newCoordinates) {
		
		points.coordinates.push([newCoordinates[1], newCoordinates[0]])
		
		pointsPath.datum(points)
		
		// add tweet points layer
		pointsLayer = d3.geoPath()
			.projection(projection)
			
		pointsPath.attr('d', pointsLayer)
		
	}
	
	/****************************************
	* 
	* Event listeners
	* 
	****************************************/
	
	return this	
}

module.exports = MapRenderer
