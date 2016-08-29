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
		//~ console.log('tweet with .geo', msg.geo)
		mapRenderer.updatePoints([msg.geo.coordinates[1], msg.geo.coordinates[0]])
	}
	else {
		 //~ console.log('place', msg.place)
		//~ var coordinates = [msg.place.bounding_box.coordinates[0][0]]
		var coordinates = generateRandomPointwithinBbox(msg.place.bounding_box.coordinates[0])
		//~ console.log('generated coordinates', coordinates)
		mapRenderer.updatePoints(coordinates)
		
	}
})

var svg = d3.select('#mapContainer')
	, mapRenderer = new MapRenderer(svg)

mapRenderer.init()

function generateRandomPointwithinBbox(bbox) {
	
	return [
		((bbox[3][0] - bbox[1][0])  / 2) + bbox[1][0]
		, ((bbox[3][1] - bbox[1][1])  / 2) + bbox[1][1]
	]
	
}
