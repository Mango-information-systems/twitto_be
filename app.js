var io = require('socket.io')({ path: '/ws/'})
	, express = require('express')
	, tuiter = require('tuiter')
	, utils = require('./controller/utils')
	, Datastore = require('./model/index')
	, ServerMap = require('./views/serverMap')
	, params = require('./params')
	, debug = require('debug')('server')
	, serverMap = new ServerMap() 
	, cache = {
		svgMap: null
		, tweets: null
	}
	, app = express()


var appData = new Datastore()

// set the view engine to ejs
app.set('view engine', 'ejs')
app.use(express.static('public'))

// index page
app.get('/', function (req, res) {
	//~ console.log('serving svgmap', cache.svgMap)
	res.render('pages/index', {
		svg: cache.svgMap
		, tweets: cache.tweets
	})
})

app.listen(8080)
console.log('knock on the magic 8080 port')

var tu = require('tuiter')(params.twitter)

// validate that the connection works, cf. https://github.com/impronunciable/Tuiter/issues/40
tu.rateLimitStatus(function(err, data){
	if (err) {
		console.log('error connecting to twitter API' , data)
		throw err
	}
})

// refresh pre-rendered svg 
appData.tweets.getAll(function(tweets) {
	cache.svgMap = serverMap.generate(tweets)
})

setInterval(updateCache, 120000)
//~ , 3000)

// refresh pre-rendered svg and tweets cache
function updateCache () {
	appData.tweets.getAll(function(tweets) {
		//~ console.log('tweets', tweets.length)
		cache.tweets = tweets
		cache.svgMap = serverMap.generate(tweets)
//~ console.log('res', cache.svgMap)
	})
	
}

updateCache ()

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
				
				appData.tweets.add(tweet)
				io.sockets.emit('tweet', tweet)
			}
		})
		stream.on('error', function(err){
			console.log('error with twitter streaming API', err)
			console.log('reconnecting in (ms)', 700 * (1 + errCount * 3))
			
			stream.emit('end')
			
			setTimeout(function() {
				streamTweets(errCount+1)
			}, 700 * (1 + errCount * 3))
			
		})
	})
	
	
	function generateRandomPointwithinBbox(bbox) {
		
		deltaSignLat = Math.sign(Math.round(Math.random()) - .5)
			, deltaLat = Math.random() / 75 * deltaSignLat
			, deltaSignLon = Math.sign(Math.round(Math.random()) - .5)
			, deltaLon = Math.random() / 75 * deltaSignLon
		
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
