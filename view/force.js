var d3 = require('d3')

/**
* force layout chart view
*
* @constructor
* 
* @return {string} chart SVG
* 
*/
function ForceChart() {

	let self = this
		, nodeMargin = 55
		, width = 650
		, height = 650
		, textScale = d3.scaleLinear()
			.range([.4, .8])
		, color = d3.scaleOrdinal(d3.schemeCategory10)
		, x = d3.scaleLinear()
			.range([nodeMargin, width - nodeMargin])
		, y = d3.scaleLinear()
			.range([nodeMargin, height - nodeMargin])
		, weightScale = d3.scaleLog()
			.range([1, 8])

	/****************************************
	 *
	 * Private methods
	 *
	 ****************************************/
	
	/**
	 * update nodes on tick event
	 * 
	 * @private
	 * 
	 */
	 function ticked() {
		 
		self.node.attr('transform', function(d, i) {
			
			//~if (i === 0) {
				//~console.log('d.x', d.x)
				//~console.log('nodeMargin', nodeMargin)
				//~console.log('self.width - nodeMargin', self.width - nodeMargin)
				//~console.log('set d.x',Math.max(nodeMargin, Math.min(self.width - nodeMargin, d.x)))
				
			//~}
			
			d.x = Math.max(nodeMargin, Math.min(self.width - nodeMargin, d.x))
				d.y = Math.max(nodeMargin, Math.min(self.height - nodeMargin, d.y))
			
				
			return 'translate(' + d.x + ',' + d.y + ')'
		})

	 }

	/**
	 * display links when the animation is over
	 * 
	 * @private
	 * 
	 */
	 function ended() {
		
		//~ debug('force simulation ended')
		self.linkconsole.log('force simulation ended')
		
		// curved links lines
		// as seen in https://stackoverflow.com/a/13456081
		self.link.attr('d', function(d, i) {

			var dx = d.target.x - d.source.x
				, dy = d.target.y - d.source.y
				, dr = Math.sqrt(dx * dx + dy * dy)
			
			return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y
		  })
		  .attr('stroke-opacity', .5)
		  .attr('stroke-width', function(d) { return .8 + 3 * self.weightScale(d.weight)})
		  .attr('stroke',  function(d) { return color(d.source.group)})
		  .attr('fill',  'none')

		d3.select('#links')
		  .transition()
		    .style('opacity', 1)

		    
		// avoid overlapping labels
		relax(self.node)
		
	 }


	/**
	 * relax position of text labels, whenever they are overlapping.
	 * 
	 * @param {object} text Labels d3 selection
	 * 
	 * @private
	 * 
	 */
	function relax(textLabels) {
		// relax the position of overlapping labels
		// only vertical position is modified
		// based on https://blog.safaribooksonline.com/2014/03/11/solving-d3-label-placement-constraint-relaxing/

		var alpha = 0.5
			, spacing = 15
			, again = false

		textLabels.each(function (d, i) {
			a = this
			da = d3.select(a)
			//~ y1 = da.attr('y')
			
			var daTransform = getTransformation(da.attr('transform'))
			
			y1 = daTransform.translateY
			textLabels.each(function (d, j) {
				b = this
				// a & b are the same element and don't collide.
				if (a == b) return
				
				db = d3.select(b)
				// Now let's calculate the distance between
				// these elements. 
				//~ y2 = db.attr('y')
				var dbTransform = getTransformation(db.attr('transform'))
				y2 = dbTransform.translateY
				
				deltaY = y1 - y2
				
				if (Math.abs(deltaY) > spacing)
					// Our spacing is greater than our specified spacing,
					// so they don't collide.
					return

				if (!overlap ( a, b)) return
				
				// If the labels collide, we'll push each 
				// of the two labels up and down a little bit.
				again = true
				sign = deltaY > 0 ? 1 : -1
				adjust = sign * alpha
				
				da.attr('transform', 'translate(' + daTransform.translateX + ',' + (y1 + adjust) + ')')

				db.attr('transform', 'translate(' + dbTransform.translateX + ',' + (y2 - adjust) + ')')
			})
		})
		// Adjust our line leaders here
		// so that they follow the labels. 
		if(again) {
			setTimeout(function() {relax(textLabels)}, 10)
		}
		//~else {
			//~// both force layout and overlap prevention are finished, display export button
			//~d3.select('#exportLink').style('display', 'block')
		//~}
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
	
	// as in http://stackoverflow.com/a/38230545/1006854
	function getTransformation(transform) {
	  // Create a dummy g for calculation purposes only. This will never
	  // be appended to the DOM and will be discarded once this function 
	  // returns.
	  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	  
	  // Set the transform attribute to the provided string value.
	  g.setAttributeNS(null, 'transform', transform);
	  
	  // consolidate the SVGTransformList containing all transformations
	  // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
	  // its SVGMatrix. 
	  var matrix = g.transform.baseVal.consolidate().matrix;
	  
	  // Below calculations are taken and adapted from the private function
	  // transform/decompose.js of D3's module d3-interpolate.
	  // var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
	  var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
	  var scaleX, scaleY, skewX;
	  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
	  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
	  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
	  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
	  return {
		translateX: e,
		translateY: f,
		rotate: Math.atan2(b, a) * 180 / Math.PI,
		skewX: Math.atan(skewX) * 180 / Math.PI,
		scaleX: scaleX,
		scaleY: scaleY
	  };
	}


	/****************************************
	 *
	 * Public methods
	 *
	 ****************************************/

	/**
	 * initialize chart
	 * 
	 */
	this.init = function (opts) {
		
		self.svg = d3.select('#graph').html('')
			.append('svg')
			  .attr('id', 'chartSVG')
			  .attr('width', '100%')
			  .attr('height', '100%')
			  .attr('preserveAspectRatio', 'xMinYMin')
			  .attr('viewBox', '0 0 ' + width + ' ' + height)
			  .append('g')
		
		self.link = self.svg.append('g')
			.attr('id', 'links')
			.attr('stroke', '#ddd')
			.attr('stroke-width', .5)
			.style('opacity', .3)
		
		self.node = self.svg.append('g')
			.attr('id', 'nodes')
	}

	/**
	 * Update chart
	 *
	 * @param {object} data updated graph
	 * 
	 */
	this.update = function (data) {
		
		//~ console.log('graph data', data)
		// temp
		window.graph = data
		
		const t = self.svg.transition().duration(900)
			, minX = d3.min(data.nodes, function(d) { return d.x})
			, minY = d3.min(data.nodes, function(d) { return d.y})
			, maxX = d3.max(data.nodes, function(d) { return d.x})
			, maxY = d3.max(data.nodes, function(d) { return d.y})

		textScale.domain([d3.min(data.nodes, function(d) { return d.count}), d3.max(data.nodes, function(d) { return d.count})])
		
		x.domain([Math.min(minX, minY), Math.max(maxX, maxY)])
		y.domain([Math.min(minX, minY), Math.max(maxX, maxY)])

		weightScale.domain(d3.extent(data.edges, function (d) { return d.weight }))

		// Apply the general update pattern to the nodes.
		let nodeSelection = self.node.selectAll('.node')
			  .data(data.nodes, d => d.key)
			  
			  
		nodeSelection.join(
		  enter => 
			  enter.append('text')
				  .attr('class', 'node')
				  .text( d => d.key )
				  .attr('dy', '2.5')
				  .style('font-size', d => textScale(d.count) + 'rem')
				  .style('text-anchor', 'middle')
		)
		.call(all => all.transition(t)
				  .attr('x', d => x(d.x))
				  .attr('y', d => y(d.y))
				  //~.attr('transform', d => 'scale(' + textScale(d.count) + ')')
				  //~.style('fill', function(d) { return color(d.modularity) })
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
				  .style('stroke-width', function(d) { return weightScale(d.weight)})
				  //~.style('stroke',  function(d) { return color(data.nodes[d.source].modularity)})
				  .style('stroke',  '#ccc')
				  .style('fill',  'none')
		  )
		.call(all => all.transition(t)
				  .attr('d', (d, i) => {

					var dx = x(data.nodes[d.target].x - data.nodes[d.source].x)
						, dy = y(data.nodes[d.target].y - data.nodes[d.source].y)
						, dr = Math.sqrt(dx * dx + dy * dy)
					
					return 'M' + x(data.nodes[d.source].x) + ',' + y(data.nodes[d.source].y) + 'A' + dr + ',' + dr + ' 0 0,1 ' + x(data.nodes[d.target].x) + ',' + y(data.nodes[d.target].y)
				  })
				  .style('stroke-opacity', .7)
		)
		
		linkSelection.exit().remove()

	}

}

module.exports = ForceChart
