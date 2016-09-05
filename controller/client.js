var d3 = require('d3')
	, io = require('socket.io-client')
	, Map = require('../views/map')
	, LineChart = require('../views/lineChart')
	, StatsCalculator = require('../views/statsCalculator')
	, app = {
		model: {
			tweets: []
		}
		, controller: {
			stats: {}
		}
		, view: {}
	}

// Initialize views
app.view.map = new Map(d3.select('#map'))
app.view.tweetsPerMinute = new LineChart(d3.select('#tweetsPerMinute'), 'm')
app.view.tweetsPerSecond = new LineChart(d3.select('#tweetsPerSecond'), 's')


//~ var suffix = window.location.hostname === 'localhost'? ':3030' : ''
var suffix = ':3030'
	//~ , mapSvg = d3.select('#map')
	//~ , tweetsPerMinuteSvg = d3.select('#tweetsPerMinute')
	//~ , tweetsPerSecondSvg = d3.select('#tweetsPerSecond')
	//~ , map = new Map(mapSvg, tweetsCache)
	//~ , tweetsPerMinuteChart = new LineChart(tweetsPerMinuteSvg, tweetsCache, 'm')
	//~ , tweetsPerSecondChart = new LineChart(tweetsPerSecondSvg, tweetsCache, 's')
	//~ , statsCalculator = new StatsCalculator(tweetsCache)
	//~ , stats = statsCalculator.calculate()

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

app.socket.on('tweets', function (tweets) {
	
	app.model.tweets = app.model.tweets.concat(tweets)
	
	app.view.map.addPoints(app.model.tweets.filter(function(tweet) {
		return typeof tweet.twitto.coordinates !== 'undefined'
	}))
	
	app.view.tweetsPerMinute.init(tweets)
	app.view.tweetsPerSecond.init(tweets)
})

app.socket.on('tweet', function (tweet) {
	
	app.model.tweets.push(tweet)
	
	app.view.map.addPoints(app.model.tweets.filter(function(tweet) {
		return typeof tweet.twitto.coordinates !== 'undefined'
	}), 1)
	app.view.tweetsPerMinute.addTweet()
	app.view.tweetsPerSecond.addTweet()
	//~ stats = statsCalculator.increment(stats, msg)
	//~ statsCalculator.render(stats, msg)

})

//~ statsCalculator.render(stats, {})



