var io = require('socket.io-client')
	, app = {}

//~ var suffix = window.location.hostname === 'localhost'? ':3030' : ''
var suffix = ':3030' 

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})
console.log('yes')

app.socket.on('tweet', function(msg) {
	console.log('tweet', msg)
})
