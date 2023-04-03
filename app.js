const Io = require('socket.io')
	, path = require('path')
	, fs = require('fs')
	, express = require('express')
	, params = require('./params')
	, debug = require('debug')('server')
	, app = express()
	, twitto = {
		controller: {}
		, meta: {
			searchHashtags: []
		}
		, model: {}
		, router: {}
	}

const server = require('http').Server(app)

// set the view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname + '/view'))

app.use(express.static( __dirname + '/public'))

app.disable('x-powered-by')

// launch express server
server.listen(params.port)

console.log('Express server started')

// Render home page to static file
app.render('pages/index', {
		appMeta : params.content.appMeta
		, logo: params.content.logo
		, appText: params.content.appText
		, ga: params.googleAnalytics
		, monitor: params.monitor.description
	}, function(err, res) {
	if (err)
		console.log('Error rendering index.html', err)
	else {
		fs.writeFile(__dirname + '/public/index.html', res, function(err, res) {
			if (err)
				console.log('error saving index.html file', err)
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
