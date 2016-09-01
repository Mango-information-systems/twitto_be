var Io = require('socket.io')
	, express = require('express')
	, utils = require('./controller/utils')
	, TweetStream = require('./controller/tweetStream')
	, Datastore = require('./model/index')
	, ServerMap = require('./views/serverMap')
	, params = require('./params')
	, debug = require('debug')('server')
	, app = express()
	, twitto = {
		controller: {}
		, model: {}
	}

twitto.controller.io = Io({ path: '/ws/'})

twitto.controller.serverMap = new ServerMap()

twitto.model = new Datastore(twitto)

twitto.controller.tweetStream = new TweetStream() 

// set the view engine to ejs
app.set('view engine', 'ejs')

app.use(express.static('public'))


// warm-up data cache, then launch http server
twitto.model.updateCache (function() {
	// launch express server once cache is refreshed
	app.listen(8080)
	console.log('knock on the magic 8080 port')

})


// index page route
app.get('/', function (req, res) {
	//~ console.log('serving svgmap', cache.svgMap)
	res.render('pages/index', {
		svg: twitto.model.cache.svgMap
		, tweets: twitto.model.cache.tweets
	})
})

//~ 
//~ twitto.controller.io.on('connection', function(socket) {
	//~ 
	//~ debug('connection event', socket.id)

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

//~ })

twitto.controller.io.listen(3030)
