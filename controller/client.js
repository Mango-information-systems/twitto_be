var d3 = require('d3')
	, io = require('socket.io-client')
	, MapRenderer = require('../views/mapRenderer')
	, StatsCalculator = require('../views/statsCalculator')
	, app = {}

//~ var suffix = window.location.hostname === 'localhost'? ':3030' : ''
var suffix = ':3030'
	, svg = d3.select('#mapContainer')
	, mapRenderer = new MapRenderer(svg, tweetsCache)
	, statsCalculator = new StatsCalculator(tweetsCache)
	, stats = statsCalculator.calculate()

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

app.socket.on('tweet', function (msg) {
	//~ console.log('new tweet received', msg.id_str)
	mapRenderer.updatePoints(msg)
	stats = statsCalculator.increment(stats, msg)
	statsCalculator.render(stats, msg)

})

statsCalculator.render(stats, {})



