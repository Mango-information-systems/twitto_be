window.debug = require('debug')

const d3 = require('d3')
	, io = require('socket.io-client')
	, polyfills = require('../controller/polyfills')
	, LineChart = require('../view/lineChart')
	//~, BarChart = require('../view/barChart')
	, DonutChart = require('../view/donutChart')
	, Force = require('../view/force')
	, Legend = require('../view/legend')
	, colorScale = d3.scaleOrdinal(d3.schemeCategory10)
	, debug = window.debug('clientApp')

let app = {
		model: {
			tweets: [] // cache of tweets  - only contains tweets with geo-coordinates
		}
		, controller: {
			stats: {}
		}
		, view: {}
	}

// Initialize views
app.view.tweetsPerMinute = new LineChart(d3.select('#tweetsPerMinute'), 'm')
app.view.tweetsPerSecond = new LineChart(d3.select('#tweetsPerSecond'), 's')
app.view.donutChart = new DonutChart(d3.select('#tweetStats'))
//~app.view.topHashTags = new BarChart(d3.select('#topHashTags'))
//~app.view.topMentions = new BarChart(d3.select('#topMentions'))
app.view.force = new Force(d3.select('#graph'), colorScale)
app.view.legend = new Legend(d3.select('#legend'), colorScale)

var suffix = window.location.hostname === 'localhost'? ':3031' : ''

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

// ask for the historical tweets
app.socket.emit('tweets')

// listener: set of historical tweets sent by the server
//~ app.socket.on('tweets', function (tweets) {
	//~ 
	//~ app.model.tweets = app.model.tweets.concat(tweets.filter(function(tweet) {
		//~ return typeof tweet.coordinates !== 'undefined'
	//~ }))
//~ 
//~ 
//~ })

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
 
	 //~d3.selectAll('#topEntitiesBarchartsWrap').classed('loading', false)
 
	 //~app.view.topHashTags.render('hashtags', stats.topHashtags)
	 
	 //~app.view.topMentions.render('mentions', stats.topMentions)
	 
	 app.view.force.update(graphData)
	 app.view.legend.update(graphData.communities)
	 
	 d3.selectAll('#graph').classed('loading', false)
 
 })

// listener: new tweet
app.socket.on('tweet', function (tweet) {
	
	debug('tweet event', tweet)
	
	if (typeof tweet.coordinates !== 'undefined') {
		app.model.tweets.push(tweet)

		//~ app.view.map.addPoints(app.model.tweets)
	}
	
	app.view.tweetsPerMinute.addTweet()
	app.view.tweetsPerSecond.addTweet()
	app.view.donutChart.addTweets([tweet])
	
})
