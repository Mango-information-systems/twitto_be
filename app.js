var tuiter = require('tuiter')
	, utils = require('./controller/utils')
	, params = require('./params')
	

var tu = require('tuiter')(params.twitter)


tu.filter({locations: [{lat: 49.496899, long: 2.54563}, {lat: 51.505081, long: 6.40791}]}, function(stream){
	console.log('here')
	stream.on('tweet', function(data){
		console.log(data.text)
	})
	stream.on('error', function(data){
		console.log('error', data)
	})
})


