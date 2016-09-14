var params = require('../params')
	, debug = require('debug')('tweetStream')

var tweetStream = new TweetStream()



/**
* Set of functions to extract tweets in real time
*
* @constructor
* 
*/
function TweetStream () {

	var tu = require('tuiter')(params.twitter)
		, errCount = 0

	// validate that the connection works, cf. https://github.com/impronunciable/Tuiter/issues/40
	tu.rateLimitStatus(function(err, data){
		if (err) {
			console.log('error connecting to twitter API' , data)
			throw err
		}
		else
			debug('successfully tested twitter API connection')
	})

	/****************************************
	* 
	* private methods
	* 
	****************************************/

	/**
	* monitor tweets geolocated in Belgium, using twitter's streaming API
	*
	* @private
	* 
	*/
	function streamTweets() {
		debug('running streamTweets')
		
		tu.filter({locations: [{lat: 49.496899, long: 2.54563}, {lat: 51.505081, long: 6.40791}]}, function(stream){
			stream.on('tweet', function(tweet){

				if (tweet.place.country_code === 'BE') {
					
					tweet.twitto = {}

					if (tweet.geo) {
						//~ // console.log('tweet with .geo', msg.geo)
						tweet.twitto.coordinates = [tweet.geo.coordinates[1], tweet.geo.coordinates[0]]
					}
					else if (tweet.place.place_type !== 'country'){
						 //~ console.log('place', JSON.stringify(msg.place.bounding_box.coordinates))
						tweet.twitto.coordinates = generateRandomPointwithinBbox(tweet.place.bounding_box.coordinates[0])
					}
					
					// send tweet to the parent process
					process.send(tweet)
				}
			})
			stream.on('error', function(err){
				console.log('error with twitter streaming API', err)
				console.log('reconnecting in (ms)', 700 * (1 + errCount * 4))
				
				stream.emit('end')
				
				setTimeout(function() {
					errCount++
					streamTweets()
				}, Math.min(700 * (1 + errCount * 4), 120000))
				
			})
		})
		
		// when tweets point to a city instead of an exact point, point to a random location around the center of city's bounding box
		function generateRandomPointwithinBbox(bbox) {
			
			deltaSignLat = Math.sign(Math.round(Math.random()) - .5)
				, deltaLat = Math.random() / 80 * deltaSignLat
				, deltaSignLon = Math.sign(Math.round(Math.random()) - .5)
				, deltaLon = Math.random() / 120 * deltaSignLon
			
			return [
				((bbox[3][0] - bbox[1][0])  / 2) + bbox[1][0] + deltaLat
				, ((bbox[3][1] - bbox[1][1])  / 2) + bbox[1][1] + deltaLon
			]

		}

	}

	debug('starting streamTweets')
	streamTweets()

}
