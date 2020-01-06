const sigma = require( 'sigma')
	, {UndirectedGraph} = require('graphology')

/**
* force-directed graph view
*
* Force-atlas 2 layout is already computed server side.
*
* @constructor
* 
* @return {string} chart SVG
* 
*/
function ForceChart(container) {

	var self = this
	
	self.container = container
	
	/****************************************
	 *
	 * Private methods
	 *
	 ****************************************/
	
		
	/****************************************
	 *
	 * Public methods
	 *
	 ****************************************/

	/**
	 * initialize chart
	 * 
	 */
	this.init = function (graph) {
		console.log('renderers', sigma)
		console.log('graph', graph)
		console.log('self.container', self.container)
		
		const g = new UndirectedGraph()
		g.import(graph)
		
		const renderer = new sigma.WebGLRenderer(g, self.container)
		
	}

}

module.exports = ForceChart
