var d3 = require('d3')
	, mapData = require('../data/belgian-provinces')
	, debug = require('debug')('mapRenderer')

/**
* Draw the map
*
* @constructor
* 
*/
function MapRenderer (app) {

	var self = this
	
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
	this.render = function(svg) {
		
		var projection = d3.geoMercator()
			.center([5, 48.9])
			.scale(960 * 6)
	// TODO: dynamically set width and height according to chart dimensions
			.translate([960 / 2, 500])
			
		var path = d3.geoPath()
			.projection(projection)
			
		var polygon = svg.append('path')
			polygon.datum(mapData)
			
			polygon.attr('d', path)
		
		
	}
	
	/****************************************
	* 
	* Event listeners
	* 
	****************************************/
	
	return this	
}

module.exports = MapRenderer
