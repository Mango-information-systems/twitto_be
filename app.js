var io = require('socket.io')({ path: '/ws/'})
	, express = require('express')
	, tuiter = require('tuiter')
	, utils = require('./controller/utils')
	, Datastore = require('./model/index')
	, ServerMap = require('./views/serverMap')
	, params = require('./params')
	, debug = require('debug')('server')
	, app = express()
	, twitto = {
		controller: {}
		, model: {}
	}

twitto.controller.serverMap = new ServerMap() 
twitto.model = new Datastore(twitto)

// set the view engine to ejs
app.set('view engine', 'ejs')

app.use(express.static('public'))

// index page
app.get('/', function (req, res) {
	//~ console.log('serving svgmap', cache.svgMap)
	res.render('pages/index', {
		svg: twitto.model.cache.svgMap
		, tweets: twitto.model.cache.tweets
	})
})

var tu = require('tuiter')(params.twitter)

// validate that the connection works, cf. https://github.com/impronunciable/Tuiter/issues/40
tu.rateLimitStatus(function(err, data){
	if (err) {
		console.log('error connecting to twitter API' , data)
		throw err
	}
})

twitto.model.updateCache (function() {
	// launch express server once cache is refreshed
	app.listen(8080)
	console.log('knock on the magic 8080 port')

})

function streamTweets(errCount) {
	
	tu.filter({locations: [{lat: 49.496899, long: 2.54563}, {lat: 51.505081, long: 6.40791}]}, function(stream){
		stream.on('tweet', function(tweet){

			if (tweet.place.country_code === 'BE') {
				//~ console.log('tweet', msg.geo, msg.place)
				
				if (tweet.geo) {
					//~ // console.log('tweet with .geo', msg.geo)
					tweet.coordinates = [tweet.geo.coordinates[1], tweet.geo.coordinates[0]]
				}
				else {
					 //~ console.log('place', JSON.stringify(msg.place.bounding_box.coordinates))
					tweet.coordinates = generateRandomPointwithinBbox(tweet.place.bounding_box.coordinates[0])
				}
				
				twitto.model.tweets.add(tweet)
				io.sockets.emit('tweet', tweet)
			}
		})
		stream.on('error', function(err){
			console.log('error with twitter streaming API', err)
			console.log('reconnecting in (ms)', 700 * (1 + errCount * 4))
			
			stream.emit('end')
			
			setTimeout(function() {
				streamTweets(errCount+1)
			}, Math.min(700 * (1 + errCount * 4), 120000))
			
		})
	})
	
	
	function generateRandomPointwithinBbox(bbox) {
		
		deltaSignLat = Math.sign(Math.round(Math.random()) - .5)
			, deltaLat = Math.random() / 60 * deltaSignLat
			, deltaSignLon = Math.sign(Math.round(Math.random()) - .5)
			, deltaLon = Math.random() / 80 * deltaSignLon
		
		return [
			((bbox[3][0] - bbox[1][0])  / 2) + bbox[1][0] + deltaLat
			, ((bbox[3][1] - bbox[1][1])  / 2) + bbox[1][1] + deltaLon
		]

	}

}

streamTweets(0)

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
