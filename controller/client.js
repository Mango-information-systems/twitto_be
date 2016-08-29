var d3 = require('d3')
	, io = require('socket.io-client')
	, MapRenderer = require('../view/mapRenderer')
	, mapRenderer = new MapRenderer()
	, app = {}

//~ var suffix = window.location.hostname === 'localhost'? ':3030' : ''
var suffix = ':3030' 

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

app.socket.on('tweet', function(msg) {
	console.log('tweet', msg.geo, msg.place)
})


var svg = d3.select('#mapContainer')

mapRenderer.render(svg)
