var params = require('../params')
	, debug = require('debug')('tweetBot')

var tweetBot = new TweetBot()
/**
 * Set of functions to process auto tweets
 *
 *
 * @constructor
 *
 */
function TweetBot() {

	var tu = require('tuiter')(params.twitter)
		, hourlyMentionsText = params.tweet_text.hourly_mentions
		, hourlyHashtagsText = params.tweet_text.hourly_hashtags
		, dailyText = params.tweet_text.daily_stats

	process.on('message', function (msg) {
		var topHashtags = ''
			, topMentions = ''
			, listOfTweets = []


		if(msg.type == 'hourly') {

			topMentions = msg.entities.topMentions.slice(0, 3).reduce(
				function (string, obj) {
					return string + '@' + obj.key + ' '
				}, '')
			topHashtags = msg.entities.topHashtags.slice(0, 3).reduce(
				function (string, obj) {
					return string + '#' + obj.key + ' '
				}, '')

			if(topMentions) {
				listOfTweets.push(hourlyMentionsText.replace('$1', topMentions))
			}
			if(topHashtags) {
				listOfTweets.push(hourlyHashtagsText.replace('$1', topHashtags))
			}
		}
		else {
			listOfTweets.push(dailyText.replace('$1', msg.tweets.totalCount))
		}

		listOfTweets.forEach(function (tweet) {
			if(params.enable_tweets) {
				tu.update({status: tweet}, function (err, data) {
				})
			}
			console.log('Tweeting ', msg.type, ' : ', tweet)
		})

	})

	debug('starting tweetBot')
}
