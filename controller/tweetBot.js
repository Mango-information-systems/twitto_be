var params = require('../params')
	, Twit = require('twit')
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

	var twit = new Twit(params.twitter)
		, hourlyMentionsText = params.tweetBot.tweetText.hourlyMentions
		, hourlyHashtagsText = params.tweetBot.tweetText.hourlyHashtags
		, dailyText = params.tweetBot.tweetText.dailyStats

	process.on('message', function (msg) {
		
		debug('received ' + msg.type + ' signal to publish tweets')
		
		var topHashtags = ''
			, topMentions = ''
			, listOfTweets = []


		if(msg.type == 'hourly') {

			if (msg.entities.topMentions.length >= 3) {
				topMentions = '@' + msg.entities.topMentions[0].key + ', @' + msg.entities.topMentions[1].key + ' and @' + msg.entities.topMentions[2].key
				listOfTweets.push(hourlyMentionsText.replace('$1', topMentions))
			}
			
			if (msg.entities.topHashtags.length >= 3) {
				topHashtags = '#' + msg.entities.topHashtags[0].key + ', #' + msg.entities.topHashtags[1].key + ' and #' + msg.entities.topHashtags[2].key
				listOfTweets.push(hourlyHashtagsText.replace('$1', topHashtags))
			}

		}
		else if (msg.tweets.totalCount.length > 0){
			// msg.type === 'daily'
			listOfTweets.push(dailyText.replace('$1', msg.tweets.totalCount))
		}
		
		debug('# tweets planned to be sent:', listOfTweets.length)

		listOfTweets.forEach(function (tweet) {
			if(params.tweetBot.enableTweets) {
				twit.post('statuses/update', {status: tweet}, function (err, data, response) {
					if (typeof err !== 'undefined') {
						if (err.code !== 187) {
							console.log('error sending tweet')
							console.log('err:', err)
							console.log('data:', data)
						}
						else {
							// Error code 187: the tweet is considered as a duplicate by twitter - exactly the same trends as previous tweet.
							// no action
							debug('error 187, ignoring this tweet')
						}
					}
					else
						debug('tweet posted', tweet.id_str, tweet.text, tweet.created_at)
				})
			}
			else 
				console.log('.. tweetBot disabled, would have sent', msg.type, ':', tweet)
		})

	})
}
