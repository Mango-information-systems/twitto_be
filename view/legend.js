var d3 = require('d3')
	, debug = require('debug')('legend')

/**
* Colors legend view
*
* @constructor
* 
* @param {object} svg the d3 selection
* 
*/
function Legend (div, color) {

	let self = this

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
	 * Update chart
	 *
	 * @param {object} data updated graph
	 * 
	 */
	this.update = function (data) {
		
		debug('legend data', data)
		
		const t = div.transition().duration(600)

		// Apply the general update pattern to the nodes.
		let selection = div.selectAll('.legend')
			  .data(data, d => d)
			  
		selection.join(
		  enter => {
			  let l = enter.append('div')
				  .attr('class', 'four columns legend')
				  .style('opacity', 0)
				  
			  l.append('div')
				  .attr('class', 'legendColor')
				  .style('display', 'inline-block')
				  .style('width', '2rem')
				  .style('min-height', '1rem')
				  .style('margin-right', '.2rem')
				  
			  l.append('div')
				  .style('display', 'inline-block')
				  .html(d => d)
		  }
		)
		.call(all => {
			  
			all.selectAll('.legendColor')
				  .style('background-color', d => color(d))
				  
			all.transition(t)
			  .style('opacity', 1)
		  }
		)
		
		selection.exit().remove()
		
	}

}

module.exports = Legend
