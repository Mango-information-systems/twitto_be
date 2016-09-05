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


app.view.map = new Map(d3.select('#map'), app.model.tweets)
//~ , tweetsPerMinute = null
//~ , tweetsSecond = null


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
	
	//~ console.log('received tweets', tweets.length)
	app.model.tweets = app.model.tweets.concat(tweets)
	
	app.view.map.addPoints(app.model.tweets)
})
app.socket.on('tweet', function (tweet) {
	app.view.map.addPoints([tweet])
	//~ tweetsPerMinuteChart.addTweet()
	//~ tweetsPerSecondChart.addTweet()
	//~ stats = statsCalculator.increment(stats, msg)
	//~ statsCalculator.render(stats, msg)

})

//~ statsCalculator.render(stats, {})



