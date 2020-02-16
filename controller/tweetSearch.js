var params = require('../params')
	, Twit = require('twit')
	, debug = require('debug')('tweetSearch')

var tweetSearch = new TweetSearch()

/**
* Set of functions to extract past tweets via tweet search endpoint
*
* @constructor
* 
*/
function TweetSearch () {

	var twit = new Twit(params.twitter)
		, errCount = 0

	/****************************************
	* 
	* private methods
	* 
	****************************************/

	/**
	* lookup tweets according to settings found in params.json
	*
	* @private
	* 
	*/
	function searchTweets(maxId) {
		debug('running searchTweets')
		
		let searchQuery = {
				q: params.searchTerm
				, count: 100
				, result_type: 'recent'
			}
			, self = this
		
		if (typeof maxId !== 'undefined') {
			searchQuery.max_id = maxId
		}
			
		//~console.log('--------------------------------------------------------')
		//~console.log('--------------------------------------------------------')
		//~console.log(searchQuery)
		
		twit.get('search/tweets', searchQuery, function(err, res, response) {
			debug('search/tweets response', res)
			
			//~console.log('--------------------------------------------------------')
			//~console.log(err)
			//~console.log(res.statuses.map(t => t.id_str).join(' '))
			//~console.log(response.headers)
			//~console.log(JSON.stringify(response, null, '  '))
			
			process.send(res.statuses)
			
			if (res.statuses.length && res.search_metadata.next_results) {
				let nextStr = res.search_metadata.next_results
					nextId = nextStr.substring(nextStr.search('=')+1, nextStr.search('&'))
				setTimeout(function() {
					searchTweets(nextId)
				}, 2000)
			}
			else
				console.log('search of pas tweets completed')
		})

	}

	debug('starting searchTweets')
	
	searchTweets()

}
