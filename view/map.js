var d3 = require('d3')
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
		.center([5, 48.9])
		.scale(this.width * 13)
		.translate([this.width * 1.25 / 2, this.height * 1.25])
	
	// render the map background
	this.canvas = this.container.append('canvas').attr('height', this.height).attr('width', this.width)
	
	this.context = this.canvas.node().getContext('2d')
	this.path = d3.geoPath().projection(this.projection).context(this.context)


	var detachedContainer = document.createElement('custom')

	this.dataContainer = d3.select(detachedContainer)



	d3.json('/data/belgian-provinces.json', function (error, belgianProvinces) {
		
		self.belgianProvinces = belgianProvinces
		
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
	* @param {number} count the number of points to be added 
	* 
	****************************************/
	function bindData(tweets) {

		//~var transitionDuration = Math.min(Math.max(tweets.length, 400), 2000)
		
		var dataBinding = self.dataContainer.selectAll('custom.dot')
		  .data(tweets, function(d) { return d.id_str })

		// clear class 'new' so that existing dots are not redrawn
		dataBinding
		  .classed('new', false)

		dataBinding.enter()
		  .append('custom')
		  .classed('dot', true)
		  .attr('r', '6')
		  .attr('cx', function(d) {
			return self.projection(d.coordinates)[0]
		  })
		  .attr('cy', '-8')
		  .attr('fillStyle', 'rgba(0, 128, 0, .3')
		  //~.transition()
		  //~.duration(400)
		  //~.ease(d3.easeBounceOut)
		  //~.delay(function(d, i) { 
			//~return tweets.length === 1? 0 : 100 + i / tweets.length * transitionDuration
		  //~})
		  .attr('cy', function(d) {
			return self.projection(d.coordinates)[1]
		  })
		  .attr('r', '3')
		  //~.on('end', function(d, i) {
			  //~if (i === tweets.length-1) {
				  //~// animation of the last dot is finished, stop the canvas drawing loop
				  //~self.animationTimer.stop()
//~console.log('end canvas update')
			  //~}
		  //~})

		updateCanvas()

	}
	
	function updateCanvas() {


console.log('updating canvas')
		// clear canvas
		self.context.fillStyle = "#fff"
		self.context.rect(0, 0, self.width, self.height)
		self.context.fill()

		// draw map of Belgium as background
		self.context.beginPath()
		self.path(self.belgianProvinces)
		
		self.context.fillStyle = '#eeeeee'
		self.context.fill()

		self.context.lineWidth = '1'
		self.context.strokeStyle = '#bbbbbb'
		self.context.stroke()

		// draw the tweet dots
		var elements = self.dataContainer.selectAll('custom.dot')
		
		elements.each(function(d) {
			var node = d3.select(this)

			self.context.beginPath()
			self.context.fillStyle = node.attr('fillStyle')
			self.context.arc(node.attr('cx'), node.attr('cy'), node.attr('r'), 0, 2 * Math.PI, false);

			self.context.fill()
			self.context.closePath()

		})
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
	* @param {number} count the number of points to be added 
	* 
	****************************************/
	this.addPoints = function(tweets, count) {
		
		debug('addPoints', tweets.length)
		
		bindData(tweets)
		
		//~self.animationTimer = d3.timer(updateCanvas)

	}

	return this	
}

module.exports = Map
