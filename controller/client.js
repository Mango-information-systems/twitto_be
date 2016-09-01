var d3 = require('d3')
	, io = require('socket.io-client')
	, _ = require('underscore')
	, MapRenderer = require('../views/mapRenderer')
	, StatsCalculator = require('../views/statsCalculator')
	, app = {}

//~ var suffix = window.location.hostname === 'localhost'? ':3030' : ''
var suffix = ':3030'
	, svg = d3.select('#mapContainer')
	, mapRenderer = new MapRenderer(svg, tweetsCache)
	, statsCalculator = new StatsCalculator(tweetsCache)
	, $statsTotalTweetsLabel = d3.select('#stats .total-tweets .label')
	, $statsTotalTweetsProgress = d3.select('#stats .total-tweets progress')
	, $statsOriginalTweetsLabel = d3.select('#stats .original-tweets .label')
	, $statsOriginalTweetsProgress = d3.select('#stats .original-tweets progress')
	, stats = statsCalculator.calculate()

app.socket = io(window.location.hostname + suffix, {path: '/ws/'})

app.socket.on('tweet', function (msg) {
	//~ console.log('new tweet received', msg.id_str)
	mapRenderer.updatePoints(msg)
	stats.total++
	$statsTotalTweetsLabel.html(stats.total)

	if(msg.in_reply_to_user_id == null && msg.retweeted == false) {
		stats.original++
		$statsOriginalTweetsLabel.html(stats.original)

		$statsOriginalTweetsProgress
			.transition()
			.delay(function (d, i) {
				return i * 200
			})
			.duration(1000)
			.attr('value', (stats.original * 100) / stats.total)

	}
})

$statsTotalTweetsLabel.html(stats.total)
$statsTotalTweetsProgress
	.transition()
	.delay(function (d, i) {
		return i * 200
	})
	.duration(1000)
	.attr('value', 100)

$statsOriginalTweetsLabel.html(stats.original)
$statsOriginalTweetsProgress
	.transition()
	.delay(function (d, i) {
		return i * 200
	})
	.duration(1000)
	.attr('value', (stats.original * 100) / stats.total)



