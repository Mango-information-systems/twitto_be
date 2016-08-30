var io = require('socket.io')({ path: '/ws/'})
	, express = require('express')
	, tuiter = require('tuiter')
	, utils = require('./controller/utils')
	, ServerMap = require('./views/serverMap')
	, params = require('./params')
	, debug = require('debug')('server')
	, app = express()


// set the view engine to ejs
app.set('view engine', 'ejs')
app.use(express.static('public'))

// index page
app.get('/', function (req, res) {
	var serverMap = new ServerMap() 
	
	var svgMap = serverMap.generate()
	res.render('pages/index', {svg: svgMap})
})

app.listen(8080);
console.log('knock on the magic 8080 port');

var tu = require('tuiter')(params.twitter)

// validate that the connection works, cf. https://github.com/impronunciable/Tuiter/issues/40
tu.rateLimitStatus(function(err, data){
	if (err) {
		console.log('error connecting to twitter API' , data)
		throw err
	}
})

function streamTweets(errCount) {
	
	tu.filter({locations: [{lat: 49.496899, long: 2.54563}, {lat: 51.505081, long: 6.40791}]}, function(stream){
		stream.on('tweet', function(data){
			//~ console.log(data.text)
			if (data.place.country_code === 'BE')
				io.sockets.emit('tweet', data)
		})
		stream.on('error', function(err){
			console.log('error with twitter streaming API', err)
			setTimeout(function() {
				streamTweets(errCount+1)
			}, 250 * (1+ errCount * 700))
		})
	})
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
