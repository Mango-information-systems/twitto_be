var d3 = require('d3')
	, io = require('socket.io-client')
	, MapRenderer = require('../views/mapRenderer')
	, app = {}

//~ var suffix = window.location.hostname === 'localhost'? ':3030' : ''
var suffix = ':3030' 

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

app.socket.on('tweet', function(msg) {
	//~ // console.log('tweet', msg.geo, msg.place)
	
	var record = {id_str: msg.id_str}
	
	if (msg.geo) {
		//~ // console.log('tweet with .geo', msg.geo)
		record.coordinates = [msg.geo.coordinates[1], msg.geo.coordinates[0]]
	}
	else {
		 //~ console.log('place', JSON.stringify(msg.place.bounding_box.coordinates))
		record.coordinates = generateRandomPointwithinBbox(msg.place.bounding_box.coordinates[0])
	}
	
	mapRenderer.updatePoints(record)
})

var svg = d3.select('#mapContainer')
	, mapRenderer = new MapRenderer(svg)

mapRenderer.init()

function generateRandomPointwithinBbox(bbox) {
	
	deltaSign = Math.sign(Math.round(Math.random()) - .5)
		, delta = Math.random() / 75 * deltaSign
	
	return [
		((bbox[3][0] - bbox[1][0])  / 2) + bbox[1][0] + delta
		, ((bbox[3][1] - bbox[1][1])  / 2) + bbox[1][1] + delta
	]
	
}
