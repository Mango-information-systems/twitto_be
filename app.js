var Io = require('socket.io')
	, path = require('path')
	, express = require('express')
	, utils = require('./controller/utils')
	, Datastore = require('./model/index')
	, params = require('./params')
	, debug = require('debug')('server')
	, app = express()
	, twitto = {
		controller: {}
		, model: {}
	}

twitto.controller.io = Io({ path: '/ws/'})

twitto.model = new Datastore(twitto)

twitto.controller.tweetStream = require('child_process').fork('./controller/tweetStream')

twitto.controller.tweetStream.on('message', function(tweet) {

	twitto.model.tweets.add(tweet)
	twitto.controller.io.sockets.emit('tweet', tweet)
})


// set the view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname + '/view'))

console.log('static', __dirname + '/public')

app.use(express.static( __dirname + '/public'))

// launch express server
app.listen(8080)

console.log('knock on the magic 8080 port')

// index page route
app.get('/', function (req, res) {
	res.render('pages/index')
})
app.get('/502', function (req, res) {
	res.render('pages/502')
})


twitto.controller.io.on('connection', function(socket) {
	
	debug('client connection', socket.id)

	var t = twitto.model.tweets.getAll(function (tweets) {

		socket.emit('tweets', tweets)
		
	})

	
})

twitto.controller.io.listen(3031)
