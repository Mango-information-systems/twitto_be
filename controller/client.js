window.debug = require('debug')

const d3 = require('d3')
	, io = require('socket.io-client')
	, FeedControl = require('../controller/feedControl')
	, PageVisibility = require('../controller/pageVisibility')
	, polyfills = require('../controller/polyfills')
	, LineChart = require('../view/lineChart')
	, BarChart = require('../view/barChart')
	, DonutChart = require('../view/donutChart')
	, Force = require('../view/force')
	, Legend = require('../view/legend')
	, colorScale = d3.scaleOrdinal(d3.schemeCategory10)
	, debug = window.debug('clientApp')

let app = {
		controller: {}
		, view: {}
	}

// Initialize views
app.view.tweetsPerMinute = new LineChart(d3.select('#tweetsPerMinute'), 'm')
app.view.tweetsPerSecond = new LineChart(d3.select('#tweetsPerSecond'), 's')
app.view.donutChart = new DonutChart(d3.select('#tweetStats'))
app.view.topMentions = new BarChart(d3.select('#topMentions'))
app.view.force = new Force(d3.select('#graph'), colorScale)
app.view.legend = new Legend(d3.select('#legend'), colorScale)

var suffix = window.location.hostname === 'localhost'? ':3031' : ''

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

// initialize controllers
app.controller.feedControl = new FeedControl(app.socket, d3.select('#feedControl'), d3.select('#feedStatus'), app.view)
app.controller.pageVisibility = new PageVisibility(app.controller.feedControl)


app.socket.on('connect', function (stats) {
	app.controller.feedControl.activate()
})

// listener: tweet stats sent by the server
app.socket.on('tweetStats', function (stats) {
	
	debug('tweetStats event', stats)
	
	d3.selectAll('#tweetStatsWrap').classed('loading', false)

	app.view.donutChart.init(stats)
	
})

// listener: timelines sent by the server
app.socket.on('timelines', function (stats) {
	
	debug('timelines', stats)
	
	d3.selectAll('#timelineWrap').classed('loading', false)
	
	app.view.tweetsPerMinute.init(stats.perMinute)
	app.view.tweetsPerSecond.init(stats.perSecond)
	
})

// listener: top entities graph sent by the server
 app.socket.on('entitiesGraph', function (graphData) {
	 
	debug('entitiesGraph', graphData)
	 
	app.view.force.update(graphData)
	app.view.legend.update(graphData.communities)
	 
	d3.selectAll('#graph').classed('loading', false)
 
 })

// listener: top mentions sent by the server
app.socket.on('topMentions', function (stats) {
	
	debug('topMentions', stats)

	d3.selectAll('#topEntitiesBarchartsWrap').classed('loading', false)

	app.view.topMentions.render('mentions', stats)

})

// listener: new tweet
app.socket.on('tweet', function (tweet) {
	
	debug('tweet event', tweet)
	
	app.view.tweetsPerMinute.addTweet()
	app.view.tweetsPerSecond.addTweet()
	app.view.donutChart.addTweets([tweet])
	
})
