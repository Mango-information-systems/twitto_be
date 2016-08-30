var D3Node = require('d3-node')
	, d3 = D3Node.d3
	, d3n = new D3Node()
	, MapRenderer = require('./mapRenderer')

/**
* Wrapper around mapRenderer to generate the map on the server
*
* @constructor
* 
*/
function serverMap () {


	/**
	* Create an svg object filled with map of Belgium shape
	*
	* @return {string} the generated svg
	* 
	*/
	this.generate = function (tweets) {
		
		var svg = d3n.createSVG()
			.attr('id', 'mapContainer')
			.attr('width', '100%')
			.attr('height', '100%')
			.attr('preserveAspectRatio', 'xMinYMin')
			.attr('viewBox', '0 0 960 500')

		var mapRenderer = new MapRenderer(svg, tweets)

		mapRenderer.init()
		mapRenderer.updatePoints()

		return d3n.svgString()
	}
		
	return this	
}

module.exports = serverMap
