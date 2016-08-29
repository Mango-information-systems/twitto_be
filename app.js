var io = require('socket.io')({ path: '/ws/'})
	, tuiter = require('tuiter')
	, utils = require('./controller/utils')
	, params = require('./params')
	, debug = require('debug')('server')


var tu = require('tuiter')(params.twitter)

// validate that the connection works, cf. https://github.com/impronunciable/Tuiter/issues/40
tu.rateLimitStatus(function(err, data){
	if (err) {
		console.log('error connecting to twitter API' , data)
		throw err
	}
})

tu.filter({locations: [{lat: 49.496899, long: 2.54563}, {lat: 51.505081, long: 6.40791}]}, function(stream){
	stream.on('tweet', function(data){
		//~ console.log(data.text)
		if (data.place.country_code === 'BE')
			io.sockets.emit('tweet', data)
	})
	stream.on('error', function(err){
		console.log('error with twitter streaming API', err)
	})
})


io.on('connection', function(socket) {
	
	debug('connection event', socket.id)

	//~ /**
	//~ * listener: msg request
	//~ *
	//~ * @private
	//~ */
	//~ socket.on('msg', function(msg) {
		//~ 
		//~ debug('msg received', socket.id, msg)
		//~ 
	//~ })

})

io.listen(3030)
