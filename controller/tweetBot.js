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
		, hourlyMentionsText = params.tweetBot.tweetText.hourlyMentions
		, hourlyHashtagsText = params.tweetBot.tweetText.hourlyHashtags
		, dailyText = params.tweetBot.tweetText.dailyStats

	process.on('message', function (msg) {
		
		debug('received ' + msg.type + ' signal to publish tweets')
		
		var topHashtags = ''
			, topMentions = ''
			, listOfTweets = []


		if(msg.type == 'hourly') {

			topMentions = '@' + msg.entities.topMentions[0].key + ', @' + msg.entities.topMentions[1].key + ' and @' + msg.entities.topMentions[2].key
			
			topHashtags = '#' + msg.entities.topHashtags[0].key + ', #' + msg.entities.topHashtags[1].key + ' and #' + msg.entities.topHashtags[2].key
			
			listOfTweets.push(hourlyMentionsText.replace('$1', topMentions))

			listOfTweets.push(hourlyHashtagsText.replace('$1', topHashtags))

		}
		else {
			listOfTweets.push(dailyText.replace('$1', msg.tweets.totalCount))
		}

		listOfTweets.forEach(function (tweet) {
			if(params.tweetBot.enableTweets) {
				tu.update({status: tweet}, function (err, data) {
				})
			}
			else 
				console.log('tweetBot disabled, would have sent', msg.type, ':', tweet)
		})

	})
}