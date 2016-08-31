var d3 = require('d3')
	, io = require('socket.io-client')
	, _ = require('underscore')
	, MapRenderer = require('../views/mapRenderer')
	, app = {}

//~ var suffix = window.location.hostname === 'localhost'? ':3030' : ''
var suffix = ':3030'
	, svg = d3.select('#mapContainer')
	, mapRenderer = new MapRenderer(svg, tweetsCache)
	, $statsTotalTweetsLabel = d3.select('#stats .total-tweets .label')
	, $statsTotalTweetsProgress = d3.select('#stats .total-tweets progress')
	, $statsOriginalTweetsLabel = d3.select('#stats .original-tweets .label')
	, $statsOriginalTweetsProgress = d3.select('#stats .original-tweets progress')
	, statsCalculation = _.countBy(tweetsCache, function (msg) {
		// Original tweets, in_reply_to_user_id is null, retweeted is false
		if(msg.in_reply_to_user_id == null && msg.retweeted == false) {
			return 'original'
		}
	})
	, stats = {
		total: tweetsCache.length
		, original: statsCalculation.original
		, retweets: 0
		, replies: 0
	}

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



