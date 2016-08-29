var d3 = require('d3')
	, io = require('socket.io-client')
	, MapRenderer = require('../view/mapRenderer')
	, app = {}

//~ var suffix = window.location.hostname === 'localhost'? ':3030' : ''
var suffix = ':3030' 

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

app.socket.on('tweet', function(msg) {
	//~ console.log('tweet', msg.geo, msg.place)
	
	if (msg.geo) {
		console.log('tweet with .geo', msg.geo)
		mapRenderer.updatePoints(msg.geo.coordinates)
	}
	else {
		
	}
})

var svg = d3.select('#mapContainer')
	, mapRenderer = new MapRenderer(svg)

mapRenderer.init()
