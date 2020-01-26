const Io = require('socket.io')
	, path = require('path')
	, debounce = require('just-debounce')
	, fs = require('fs')
	, express = require('express')
	, utils = require('./controller/utils')
	, Tweets = require('./controller/tweets')
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
twitto.controller.tweets = new Tweets(twitto)

// set the view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname + '/view'))

console.log('static', __dirname + '/public')

app.use(express.static( __dirname + '/public'))

// launch express server
app.listen(8080)

console.log('knock on the magic 8080 port')

app.render('pages/502', {
		appMeta: params.content.appMeta
		, logo: params.content.logo
		, appText: params.content.appText
		, ga: params.googleAnalytics
		, maintenance: true
	}, function(err, res) {
	if (err)
		console.log('Error rendering 502.html', err)
	else {
		fs.writeFile(__dirname + '/public/502.html', res, function(err, res) {
			if (err)
				console.log('error saving 502.html file', err)
		})
	}
})


// index page route
app.get('/', function (req, res) {
	res.render('pages/index', {
		appMeta : params.content.appMeta
		, logo: params.content.logo
		, appText: params.content.appText
		, ga: params.googleAnalytics
	})
})
app.get('/502', function (req, res) {
	res.render('pages/502', {
		appMeta: params.content.appMeta
		, logo: params.content.logo
		, appText: params.content.appText
		, ga: params.googleAnalytics
		, maintenance: true
	})
})

// Redirect all requests to home page instead of 404
app.use(function(req, res, next){

	// respond with html page
	if (req.accepts('html')) {
		res.redirect(301, '/')
		return
	}
	
	res.status(404)

	// respond with json
	if (req.accepts('json')) {
		res.send({ error: 'Not found' })
		return
	}

	// default to plain-text. send()
	res.type('txt').send('Not found')
})

// visitor connection, send all tweets
twitto.controller.io.on('connection', function(socket) {
	
	debug('client connection', socket.id)

	socket.on('tweets', function() {

		// send tweets mentions and hashtags graph (for graph viz)
		//~ socket.emit('graph', twitto.model.tweets.getAllTweets())
		
		// send tweet statistics (for donut chart)
		socket.emit('tweetStats', twitto.model.tweets.getTweetCounts())

		// send tweet timelines (for timeline chart)
		socket.emit('timelines', twitto.model.tweets.getTimelines())

		// send tweets (for map)
		//~ socket.emit('tweets', twitto.model.tweets.getAllTweets())

		// send top entities graph
		 socket.emit('entitiesGraph', twitto.model.tweets.getEntitiesGraph())

	})
	
	//~setTimeout(function() {

       //~socket.emit('entitiesGraph', twitto.model.tweets.getEntitiesGraph())

	//~}, 5000)

	
})

//debounced send graph function
twitto.controller.sendGraph = debounce(function() {
	twitto.controller.io.emit('entitiesGraph', twitto.model.tweets.getEntitiesGraph())
}, 150, true)

// update graphs every n seconds
//~ setInterval(function() {

       //~ twitto.controller.io.emit('entitiesGraph', twitto.model.tweets.getEntitiesGraph())

//~ }, 5000)


twitto.controller.io.listen(3031)
