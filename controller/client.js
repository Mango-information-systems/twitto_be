var d3 = require('d3')
	, io = require('socket.io-client')
	, MapRenderer = require('../views/mapRenderer')
	, app = {}

//~ var suffix = window.location.hostname === 'localhost'? ':3030' : ''
var suffix = ':3030' 

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

app.socket.on('tweet', function(msg) {
	//~ console.log('new tweet received', msg.id_str)
	mapRenderer.updatePoints(msg)
})

var svg = d3.select('#mapContainer')
	, mapRenderer = new MapRenderer(svg, tweetsCache)
