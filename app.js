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
		, router: {}
	}

twitto.router.io = Io({ path: '/ws/'})

twitto.model = new Datastore()

twitto.controller.tweets = new Tweets(twitto)

// set the view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname + '/view'))

app.use(express.static( __dirname + '/public'))

app.disable('x-powered-by')

// launch express server
app.listen(params.ports.express)

console.log('Express server started')

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
		, monitor: params.monitor.description
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
twitto.router.io.on('connection', function(socket) {
	
	debug('client connection', socket.id)
	
	socket.join('liveFeed')
	
	twitto.controller.tweets.initDataFeed(socket)

	// make it possible to unsubscribe to live data updates
	socket.on('pause', function() {
		socket.leave('liveFeed')
	})
	
	socket.on('resume', function() {
		socket.join('liveFeed')
		
		twitto.controller.tweets.initDataFeed(socket)
	})

})

twitto.model.on('graphUpdate', function(message) {
	// send updated graph to clients
	twitto.router.sendGraph()	
	
})

//debounced send graph function
twitto.router.sendGraph = debounce(function() {
	twitto.router.io.to('liveFeed').emit('entitiesGraph', twitto.model.tweets.getEntitiesGraph())
}, 750, true)

twitto.router.io.listen(params.ports.socket)
