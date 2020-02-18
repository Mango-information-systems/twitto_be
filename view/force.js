const d3 = Object.assign({}, require('d3-selection'), require('d3-scale'), require('d3-array'), require('d3-zoom'), require('d3-transition'), require('d3-timer'))
	, d3Selection = require('d3-selection')

/**
* force layout chart view
*
* @constructor
* 
* @return {string} chart SVG
* 
*/
function ForceChart(svg, color) {

	let self = this
		, nodeMargin = 55
		, width = 650
		, height = 650
		, textScale = d3.scaleLinear()
			.range([.6, 1.5])
		, x = d3.scaleLinear()
			.range([nodeMargin, width - nodeMargin])
		, y = d3.scaleLinear()
			.range([nodeMargin, height - nodeMargin])
		, edgeWidthScale = d3.scaleLinear()
			.range([1, 4])
	
	self.stopOverlapPrevention = false		
		
	self.svg = svg.html('')
		.append('svg')
		  .attr('id', 'chartSVG')
		  .attr('width', '100%')
		  .attr('height', '100%')
		  .attr('preserveAspectRatio', 'xMinYMin')
		  .attr('viewBox', '0 0 ' + width + ' ' + height)
	
	self.g = self.svg.append('g')
		  
	self.svg.call(d3.zoom()
	  .extent([[0, 0], [width, height]])
	  .scaleExtent([1, 8])
	  .on("zoom", zoomed)
	)
	
	self.link = self.g.append('g')
		.attr('id', 'links')
		.style('opacity', .3)
	
	self.node = self.g.append('g')
		.attr('id', 'nodes')

	/****************************************
	 *
	 * Private methods
	 *
	 ****************************************/
	
	/**
	 * relax position of text labels, whenever they are overlapping.
	 * 
	 * @param {object} iterationCount
	 * 
	 * @private
	 * 
	 */
	function relax(iterationCount) {
		// relax the position of overlapping labels
		// based on https://blog.safaribooksonline.com/2014/03/11/solving-d3-label-placement-constraint-relaxing/

		let textLabels = d3.selectAll('.node')

		var alpha = 2
			, spacing = 10
			, again = false

		textLabels.each(function (d, i) {
			a = this
			da = d3.select(a)
			y1 = +da.attr('y')
			x1 = +da.attr('x')
			
			textLabels.each(function (d, j) {
				b = this
				// a & b are the same element and don't collide.
				if (a === b) return
				
				db = d3.select(b)
				// Now let's calculate the distance between these elements. 
				y2 = +db.attr('y')
				x2 = +db.attr('x')
				
				deltaY = y1 - y2
				
				if (Math.abs(deltaY) > spacing)
					// Our spacing is greater than our specified spacing,
					// so they don't collide.
					return

				if (!overlap( a, b))
					return
				
				// If the labels collide, we'll push each 
				// of the two labels up and down a little bit.
				again = true
				
				signY = deltaY > 0 ? 1 : -1
				adjustY = signY * alpha
				
				deltaX = x1 - x2
				signX = deltaX > 0 ? 1 : -1
				adjustX = signX * alpha / 3
				
				da.attr('y', y1 + adjustY)
				da.attr('x', x1 + adjustX)

				db.attr('y', y2 - adjustY)
				db.attr('x', x2 - adjustX)
			})
		})
		
		// Adjust our line leaders here
		// so that they follow the labels. 
		if(!self.stopOverlapPrevention && again &&  iterationCount < 100) {
			d3.timeout(function() {relax(++iterationCount)}, 2)
		}
		else {
			// Overlap prevention has finished to run

			if(!self.stopOverlapPrevention) {
				// update edges lines
				// quick and dirty, but at least it does the job
				self.link.selectAll('.link').transition()
					  .attr('d', (d, i) => {
						
						var dx = textLabels.nodes()[d.target].attributes.x.value - textLabels.nodes()[d.source].attributes.x.value
							, dy = textLabels.nodes()[d.target].attributes.y.value - textLabels.nodes()[d.source].attributes.y.value
							, dr = Math.sqrt(dx * dx + dy * dy)
						
						return 'M' + textLabels.nodes()[d.source].attributes.x.value + ',' + textLabels.nodes()[d.source].attributes.y.value + 'A' + dr + ',' + dr + ' 0 0,1 ' + textLabels.nodes()[d.target].attributes.x.value + ',' + textLabels.nodes()[d.target].attributes.y.value
					  })
				
				//~d3.select('#exportLink').style('display', 'block')
			}
		}
	}

	function overlap (a, b) {
		// Check whether the bounding box of two texts do overlap.
		// inspired by http://www.geeksforgeeks.org/find-two-rectangles-overlap/

		var aBbox = a.getBoundingClientRect()
			, bBbox = b.getBoundingClientRect()
			, aPoints = {
				l: {
					x: aBbox.left
					, y: aBbox.top
				}
				, r: {
					x: aBbox.left + aBbox.width
					, y: aBbox.top + aBbox.height
				}
			}
			, bPoints = {
				l: {
					x: bBbox.left
					, y: bBbox.top
				}
				, r: {
					x: bBbox.left + bBbox.width
					, y: bBbox.top + bBbox.height
				}
			}
		
		// Check whether one rectangle is on left side of other
		if (aPoints.l.x > bPoints.r.x || bPoints.l.x > aPoints.r.x)
			return false
		
		// Check whether one rectangle is on above the other
		if (aPoints.l.y > bPoints.r.y || bPoints.l.y > aPoints.r.y)
			return false
			
		return true
		
	}

	/**
	 * trigger zoom
	 * 
	 * @private
	 * 
	 */
	function zoomed() {
		self.g.attr("transform", d3Selection.event.transform)
	}
	
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
		
		//~ console.log('graph data', data)
		// temp
		//~window.graph = data
		
		self.stopOverlapPrevention = true
		
		const t = self.svg.transition().duration(600)
			, minX = d3.min(data.nodes, function(d) { return d.x})
			, minY = d3.min(data.nodes, function(d) { return d.y})
			, maxX = d3.max(data.nodes, function(d) { return d.x})
			, maxY = d3.max(data.nodes, function(d) { return d.y})

		textScale.domain([d3.min(data.nodes, function(d) { return d.count}), d3.max(data.nodes, function(d) { return d.count})])
		
		x.domain([Math.min(minX, minY), Math.max(maxX, maxY)])
		y.domain([Math.min(minX, minY), Math.max(maxX, maxY)])

		edgeWidthScale.domain(d3.extent(data.edges, function (d) { return d.weight }))

		// Apply the general update pattern to the nodes.
		let nodeSelection = self.node.selectAll('.node')
			  .data(data.nodes, d => d.key)
			  
		nodeSelection.join(
		  enter => 
			  enter.append('text')
				  .attr('class', 'node')
				  .text( d => d.key )
				  .attr('dy', '2.5')
				  .style('font-size', '1.5rem')
				  .style('text-anchor', 'middle')
		)
		.call(all => all.transition(t)
		  .attr('x', d => x(d.x))
		  .attr('y', d => y(d.y))
		  .style('font-size', d => textScale(d.count) + 'rem')
		  .style('fill', function(d) {return color(d.community) })
		)
		
		nodeSelection.exit().remove()

		
		// Apply the general update pattern to the links.
		let linkSelection = self.link.selectAll('.link')
			.data(data.edges, d => d.key)
				
		linkSelection.join(
		  enter => 
			  enter.append('path')
				  .attr('class', 'link')
				  .style('stroke-opacity', 0)
				  .style('fill',  'none')
		  )
		.call(all => { 
			let linksTransition = all.transition(t)
				  .attr('d', (d, i) => {

				      let dx = x(data.nodes[d.target].x) - y(data.nodes[d.source].x)
				      	  , dy = y(data.nodes[d.target].y) - y(data.nodes[d.source].y)
				      	  , dr = Math.sqrt(dx * dx + dy * dy)
				      
				      return 'M' + x(data.nodes[d.source].x) + ',' + y(data.nodes[d.source].y) + 'A' + dr + ',' + dr + ' 0 0,1 ' + x(data.nodes[d.target].x) + ',' + y(data.nodes[d.target].y)
				  })
				  .style('stroke',  d => color(data.nodes[d.source].community))
				  .attr('stroke-width', function(d) {return edgeWidthScale(d.weight)})
				  .style('stroke-opacity', 1)
				  
			linksTransition.end().then(() => {
				  self.stopOverlapPrevention = false
				  relax(0)
			}).catch(() => null)
		})
		
		linkSelection.exit().remove()
		


	}


	/**
	 * once live feed is resumed, stop the overlap prevention algorithm
	 *
	 */
	this.interruptOverlapPrevention = function() {
			self.stopOverlapPrevention = true
		
	}

	/**
	 * update nodes position in order to avoid overlapping text
	 *
	 */
	this.preventOverlap = function() {
		
		self.stopOverlapPrevention = false
		
		relax(0)
	}
}

module.exports = ForceChart
