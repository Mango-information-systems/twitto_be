var Io = require('socket.io')
	, express = require('express')
	, utils = require('./controller/utils')
	, TweetStream = require('./controller/tweetStream')
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

twitto.controller.tweetStream = new TweetStream(twitto) 


// set the view engine to ejs
app.set('view engine', 'ejs')

app.use(express.static('public'))

// launch express server
app.listen(8080)
console.log('knock on the magic 8080 port')

// start to listen to tweets from twitter API
twitto.controller.tweetStream.start()

// index page route
app.get('/', function (req, res) {
	//~ console.log('serving svgmap', cache.svgMap)
	res.render('pages/index')
})


twitto.controller.io.on('connection', function(socket) {
	
	debug('client connection', socket.id)

	var t = twitto.model.tweets.getAll(function (tweets) {
		socket.emit('tweets', tweets)
		
	})

	
})

twitto.controller.io.listen(3030)
