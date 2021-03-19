window.debug = require('debug')

const d3 = Object.assign({}, require("d3-selection"), require("d3-scale"))
	, io = require('socket.io-client')
	, FeedControl = require('./feedControl')
	, PageVisibility = require('./pageVisibility')
	, polyfills = require('./polyfills')
	, LineChart = require('../view/lineChart')
	, BarChart = require('../view/barChart')
	, DonutChart = require('../view/donutChart')
	, Force = require('../view/force')
	//~, colorScale = d3.scaleOrdinal(d3.schemeCategory10)
	, colorScale = d3.scaleOrdinal(['#008000', '#000', '#ff0f21', '#00aced', '#fbab00', '#FF7300', '#bb4fe2', '#ac5e1c', '#ec71b5', '#2325d6', '#65c652'])
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

app.socket = io()

// initialize controllers
// feedControl allows to pause / resume the live data feed
app.controller.feedControl = new FeedControl(app.socket, d3.select('#feedControl'), d3.select('#feedStatus'), app.view)
// pageVisibility disconnects from the live feed whenever the tab is not active
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
	 
	d3.selectAll('#graph').classed('loading', false)
	 
	app.view.force.update(graphData)
 
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
