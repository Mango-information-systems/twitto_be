var d3 = require('d3')
	, io = require('socket.io-client')
	, Map = require('../view/map')
	, LineChart = require('../view/lineChart')
	, DonutChart = require('../view/donutChart')
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
app.view.donutChart = new DonutChart(d3.select('#lastDayTweets'))

var suffix = window.location.hostname === 'localhost'? ':3031' : ''
//var suffix = ':3031'

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

// ask for the historical tweets
app.socket.emit('tweets')

// Listener: set of historical tweets sent by the server
app.socket.on('tweets', function (tweets) {
	
	app.model.tweets = app.model.tweets.concat(tweets)
	
	d3.selectAll('.loading').classed('loading', false)
	
	app.view.map.addPoints(app.model.tweets.filter(function(tweet) {
		return typeof tweet.coordinates !== 'undefined'
	}))
	
	app.view.tweetsPerMinute.init(tweets)
	app.view.tweetsPerSecond.init(tweets)
	app.view.donutChart.addTweets(tweets)

})

// Listener: new tweet sent by the server
app.socket.on('tweet', function (tweet) {
	
	app.model.tweets.push(tweet)
	
	app.view.map.addPoints(app.model.tweets.filter(function(tweet) {
		return typeof tweet.coordinates !== 'undefined'
	}), 1)
	
	app.view.tweetsPerMinute.addTweet()
	app.view.tweetsPerSecond.addTweet()
	app.view.donutChart.addTweets([tweet])

})



