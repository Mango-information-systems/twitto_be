var d3 = require('d3')
	, io = require('socket.io-client')
	, Map = require('../views/map')
	, LineChart = require('../views/lineChart')
	, StatsCalculator = require('../views/statsCalculator')
	, app = {}

//~ var suffix = window.location.hostname === 'localhost'? ':3030' : ''
var suffix = ':3030'
	, mapSvg = d3.select('#map')
	, lineChartSvg = d3.select('#lineChart')
	, map = new Map(mapSvg, tweetsCache)
	, lineChart = new LineChart(lineChartSvg, tweetsCache)
	, statsCalculator = new StatsCalculator(tweetsCache)
	, stats = statsCalculator.calculate()

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

app.socket.on('tweet', function (msg) {
	map.updatePoints(msg)
	lineChart.addTweet()
	stats = statsCalculator.increment(stats, msg)
	statsCalculator.render(stats, msg)

})

statsCalculator.render(stats, {})



