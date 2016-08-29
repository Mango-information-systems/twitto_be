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
		io.sockets.emit('tweet', data)
	})
	stream.on('error', function(err){
		console.log('error', err.code, err.text)
	})
})


io.on('connection', function(socket) {
	
	debug('connection event', socket.id)

	/**
	* listener: contact request
	*
	* @private
	*/
	socket.on('contact', function(formData, callback) {
		
		debug('contact request received', socket.id, formData)
		
	})

})

io.listen(3030)
