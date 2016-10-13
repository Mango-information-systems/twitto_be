var d3 = require('d3')
	, params = require('../params')
	, debug = require('debug')('map')

/**
* Set of functions to manage map and map content
*
* canvas + d3.js as seen in https://bocoup.com/weblog/d3js-and-canvas
* 
* @constructor
* 
*/
function Map (container) {

	var self = this
	
	this.container = container
	
	var containerSize = this.container.node().getBoundingClientRect()
	
	// TODO: update width and height on resize
	this.width = containerSize.width
	this.height = containerSize.width / 1.348

	this.projection = d3.geoMercator()
		.center([params.map.canvas.centerLat, params.map.canvas.centerLong])
		.scale(this.width * params.map.canvas.scale)
		.translate([this.width * 1.25 / 2, this.height * 1.25])

	// Zoom scale
	this.zoom = d3.zoom()
		.scaleExtent([0.5, 4])
		
	this.zoomTransformX = 0
	this.zoomTransformY = 0
	this.zoomTransformK = 1

	// render the map background
	this.canvas = this.container.append('canvas').attr('height', this.height).attr('width', this.width)
	this.canvas.call(this.zoom.on('zoom', updateCanvas))
		.on('wheel', function() { d3.event.preventDefault() })

	this.context = this.canvas.node().getContext('2d')
	this.path = d3.geoPath().projection(this.projection).context(this.context)
	
	this.colors = {
		'en': 'rgba(0, 172, 237, .3)'
		, 'fr': 'rgba(0, 128, 0, .3)'
		, 'nl': 'rgba(255, 15, 33, .3)'
		, 'fallback': 'rgba(0, 0, 0, .3)'
	}

	var detachedContainer = document.createElement('custom')

	this.dataContainer = d3.select(detachedContainer)


	d3.json(params.map.geojson, function (error, geoJsonMap) {

		self.geoJsonMap = geoJsonMap

	})
	
	
	/****************************************
	* 
	* Private methods
	* 
	****************************************/
	
	/****************************************
	* 
	* bind tweets data to a d3.js selection into a dummy DOM node
	* 
	* 
	* @param {object} tweets array of tweets to be displayed in the map
	* 
	****************************************/
	function bindData(tweets) {

		var dataBinding = self.dataContainer.selectAll('custom.dot')
		  .data(tweets, function(d) { return d.id_str })

		// clear class 'new' so that existing dots are not redrawn
		dataBinding
		  .classed('new', false)

		dataBinding.enter()
		  .append('custom')
		  .classed('dot', true)
		  .attr('r', params.map.canvas.dotRadius)
		  .attr('cx', function(d) {
			return self.projection(d.coordinates)[0]
		  })
		  .attr('cy', function(d) {
			return self.projection(d.coordinates)[1]
		  })
		  .attr('fillStyle', function(d) {
			  return self.colors[d.lang] || self.colors.fallback
		  })

		updateCanvas()

	}

	/****************************************
	* 
	* render the d3 data binding as canvas
	* 
	****************************************/
	function updateCanvas() {

		if (d3.event) {
			// set zoom level and panning
			self.zoomTransformK = d3.event.transform.k
			self.zoomTransformX = d3.event.transform.x
			self.zoomTransformY = d3.event.transform.y
		}
		
		self.context.save()
		
		self.context.clearRect(0, 0, self.width, self.height)
		
		self.context.translate(self.zoomTransformX, self.zoomTransformY)
			
		self.context.scale(self.zoomTransformK, self.zoomTransformK)

		// draw map of the country as background
		self.context.beginPath()
		self.path(self.geoJsonMap)
		
		self.context.fillStyle = '#eeeeee'
		self.context.fill()

		self.context.lineWidth = '1'
		self.context.strokeStyle = '#bbbbbb'
		self.context.stroke()

		// draw legend
		self.context.beginPath()
		self.context.fillStyle = self.colors['en']
		self.context.arc(40, 300, self.zoomTransformK > 2 ? 2 : 6, 0, 2 * Math.PI, false)
		self.context.fill()
		self.context.closePath()
		
		self.context.fillStyle = 'black'
		self.context.fillText('en', 52, 303)
		
		self.context.beginPath()
		self.context.fillStyle = self.colors['fr']
		self.context.arc(40, 320, self.zoomTransformK > 2 ? 2 : 6, 0, 2 * Math.PI, false)
		self.context.fill()
		self.context.closePath()
		
		self.context.fillStyle = 'black'
		self.context.fillText('fr', 52, 323)
		
		self.context.beginPath()
		self.context.fillStyle = self.colors['nl']
		self.context.arc(40, 340, self.zoomTransformK > 2 ? 2 : 6, 0, 2 * Math.PI, false)
		self.context.fill()
		self.context.closePath()
		
		self.context.fillStyle = 'black'
		self.context.fillText('nl', 52, 343)
		
		self.context.beginPath()
		self.context.fillStyle = self.colors['fallback']
		self.context.arc(40, 360, self.zoomTransformK > 2 ? 2 : 6, 0, 2 * Math.PI, false)
		self.context.fill()
		self.context.closePath()
		
		self.context.fillStyle = 'black'
		self.context.fillText('other', 52, 363)
		
		// draw the tweet dots
		var elements = self.dataContainer.selectAll('custom.dot')
		
		elements.each(function(d) {
			var node = d3.select(this)

			self.context.beginPath()
			self.context.fillStyle = node.attr('fillStyle')

			self.context.arc(node.attr('cx'), node.attr('cy'), self.zoomTransformK > 2 ? 1 : 3, 0, 2 * Math.PI, false)

			self.context.fill()
			self.context.closePath()

		})
		
		self.context.restore()
		
	}
	
	/****************************************
	* 
	* Public methods
	* 
	****************************************/
	
	/****************************************
	* 
	* addPoints displays geo-located tweets in the map
	* 
	* @param {object} tweets array of tweets to be displayed in the map
	* 
	****************************************/
	this.addPoints = function(tweets) {
		
		debug('addPoints', tweets.length)
		
		bindData(tweets)

	}

	return this	
}

module.exports = Map
