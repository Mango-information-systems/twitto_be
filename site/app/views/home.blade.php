@extends('_layouts.default')
@section('main')
<div id="scrolltop">&nbsp;</div>
<div class="row-fluid">
	<div class="span3">
		<div class="row-fluid">
			<h3>Filters <small>click charts to filter data</small></h3>
			<div id="topics-chart" class="span12">
				<strong>Topics</strong>
				<a class="reset" href="javascript:topicsChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
				<img src="assets/img/topics-chart-placeholder.png" class="placeholder"/>
				<div class="clearfix"></div>
			</div>
			<div id="be-chart" class="span12">
				<strong>Provinces</strong>
				<a class="reset" href="javascript:beChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
				<span class="reset" style="display: none;"></span>
				<img src="assets/img/provinces-chart-placeholder.png" class="placeholder"/>
				<div class="clearfix"></div>
			</div>
			<div id="languages-chart" class="span12">
				<strong>Languages</strong>
				<a class="reset" href="javascript:languagesChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
				<img src="assets/img/languages-chart-placeholder.png" class="placeholder"/>
				<div class="clearfix"></div>
			</div>
		</div>
	</div>
	<div class="span8">
		<img src="assets/img/ranks-table-placeholder.png" class="placeholder"/>
		<table class="table table-striped" id="twitter-datatable" border="0" cellpadding="0" cellspacing="0" width="100%"></table>
		<div class="alert alert-info">
			<h3>Marketing segmentation for professionals</h3>
			<p>Do you really know who is following you? Segment your twitter followers into communities, identify the individuals that can amplify your message and see how the competition are doing.</p>
			<p><a target="_blank" href="http://tribalytics.com" class="btn btn-primary">visit tribalytics.com »</a></p>
		</div>
	</div>
	<div class="span1">
		<p>
			<strong>Share</strong>
		</p>
		<p>
			<a id="sharetwitter" href="https://twitter.com/intent/tweet?url=http%3A%2F%2Fdtwitto.be&text=Exploring%20top%20twitter%20influencers%20in%20Belgium&via=twitto_be&hashtags=twittoBe" target="_blank"><img src="/assets/img/social_twitter_circle_color.png" width="48" height="48" alt="Share on Twitter"/></a>
			<a id="sharegoogle" href="https://plus.google.com/share?url=http%3A%2F%2Fdtwitto.be" target="_blank"><img src="/assets/img/social_google_circle_color.png" width="48" height="48" alt="Share on Google+"/></a>
			<a id="sharefacebook" href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fdtwitto.be" target="_blank"><img src="/assets/img/social_facebook_circle_color.png" width="48" height="48" alt="Share on Facebook"/></a>
			<a id="sharelinkedin" href="http://www.linkedin.com/shareArticle?mini=true&url=http%3A%2F%2Fdtwitto.be&title=90000%2B%20Belgian%20tweeters%20ranked%20by%20influence%20-%20Twitto.be&summary=%40NATO%2C%20%40EU_Commission%2C%20%40Clijsterskim%20are%20in%20the%20ranking%20of%20top%20Belgian%20twittos&sourcetwitto_be" target="_blank"><img src="/assets/img/social_linkedin_circle_color.png" width="48" height="48" alt="Share on Linkedin"/></a>
		</p>
	</div>
</div>
<div class="row-fluid">

</div>
@stop

{{-- Web site Title --}}
@section('title')
{{ $page_title }}
@stop

{{-- Page description --}}
@section('description')
{{ $page_desc }}
@stop

{{-- h1 --}}
@section('h1-title')
{{ $h1_title }}
@stop

@section('inline-javascript')

<script src="/assets/js/belgian-provinces.js"></script>
<script type="text/javascript">
var provincesMap = {
		'-1' : 'not set'
		, 1 : 'Antwerp'
		, 2 : 'Brussels'
		, 3 : 'Flemish Brabant'
		, 4 : 'East Flanders'
		, 5 : 'Hainaut'
		, 6 : 'West Flanders'
		, 7 : 'Limburg'
		, 8 : 'Walloon Brabant'
		, 9 : 'Liege'
		, 10 : 'Namur'
		, 11 : 'Luxembourg'
	}
	, languagesMap = {
		'en' : 'English'
		, 'fr' : 'French'
		, 'nl' : 'Dutch'
		, 'ot' : 'Other'
	}
	, topicsMap = {
		1 : 'Belgium'
		, 2 : 'Business'
		, 3 : 'Design'
		, 4 : 'Entertainment'
		, 5 : 'Health'
		, 6 : 'Politics'
		, 7 : 'Sport'
		, 8 : 'Technology'
		, 9 : 'Media'
	}
	, reverseTopicsMap = {
		'Belgium' : 1
		, 'Business' : 2
		, 'Design' : 3
		, 'Entertainment' : 4
		, 'Health' : 5
		, 'Politics' : 6
		, 'Sport' : 7
		, 'Technology' : 8
		, 'Media' : 9
	}
	, projection = d3.geo.mercator()
		.center([5, 48.9])
		.scale(600 * 6)
// TODO: dynamically set width and height according to chart dimensions
		.translate([370 / 2, 250])
    , topicsChart = dc.rowChart("#topics-chart")
	, beChart = dc.geoChoroplethChart("#be-chart")
	, languagesChart = dc.rowChart("#languages-chart")
	, dataTable // cached selector of datatable
	, pageSliceIndex // index to add next page to the data table
	, filteredData // full dataset (crossfilter dimension)
	, fdata // top infinity of filteredData
	, twittosDetails = {} // cache of all twittos for which details have already been extracted
	, allTwittos = null //cache of all twittos metadata: province, topics, language, klout score...
	, topics
	, provincesGroup
	, topicsRows
	, $shareTwitter = $('#sharetwitter')
	, $shareGoogle = $('#sharegoogle')
	, $shareFacebook = $('#sharefacebook')
	, $shareLinkedin = $('#sharelinkedin')
	, $inPageTitle = $('h1:first') // page title inside the page
	, resized = false
	, all

var urlFilters = []
urlFilters['topics'] = '<?php echo $filters['topics']; ?>'
urlFilters['topics'] = urlFilters['topics'].split(',')
urlFilters['locations'] = '<?php echo $filters['locations']; ?>'
urlFilters['locations'] = urlFilters['locations'].split(',')
urlFilters['languages'] = '<?php echo $filters['languages']; ?>'
urlFilters['languages'] = urlFilters['languages'].split(',')

function filterData(urlFilter){
	// Check if we just resized. 
	// If resized, we do not need to do the rest
	if(resized){
		resized = false
		return
	}
// crossfilter data

	fdata = filteredData.top(Infinity);
	var scores = []
		, topThree = []
	
	if(urlFilter != null){
	// filter based on url params
		if(urlFilter['topics'][0] != ''){
			_.forEach(urlFilter['topics'], function(d){
				topicsChart.filter('' + reverseTopicsMap[d])
			})
		}
		if(urlFilter['locations'][0] != ''){
			_.forEach(urlFilter['locations'], function(d){
				beChart.filter(d)
			})
		}

		if(urlFilter['languages'][0] != ''){
			_.forEach(urlFilter['languages'], function(d){
				languagesChart.filter(d)
			})
		}
		
		dc.redrawAll()

		return
	}

	// compute ranks for current filters set
	var scores = _.pluck(fdata, 3)

	// below: ranking based on solution http://stackoverflow.com/a/14835680
	function cmp_rnum(a,b) {
		// comparison function: reverse numeric order
		return b-a
	}
	function index_map(acc, item, index) {
		// reduction function to produce a map of array items to their index
		acc[item] = index
		return acc
	}

	var rankindex = _.reduceRight(scores.slice().sort(cmp_rnum), index_map, {})

	$.each(fdata, function(index, value) {
		// assign ranks to data rows
		fdata[index][6] = rankindex[fdata[index][3]] + 1
	})

	// sort data by descending rank, in order to provide relevant subset to datatables
	fdata.sort(function(a, b) {
		return a[6] - b[6]
	})
	
	// Get top three twittos and pass them to the share function
	topThree = fdata.slice(0,3)
	topThree = _.pluck(topThree, 5)
	shareUrls(topThree)

	dataTable.fnClearTable()
	pageSliceIndex = Math.min(125, fdata.length)
	dataTable.fnAddData(fdata.slice(0, pageSliceIndex))
	
	$.unblockUI()
	
}

function historyPushState(){
// update page history state, page title, and chart color range
	// after every filter we need to refresh the chart to update the correct color range
	beChart.colorDomain([0, provincesGroup.top(1)[0].value])
	
	var topicsFilter = ''
		, provincesFilter = beChart.filters().join(',')
		, languagesFilter = languagesChart.filters().join(',')
		, newTitle = all.value() + ' top twitter influencers'
		, queryString = '?'

	_.each(topicsChart.filters(), function(item, idx) {
		if (idx > 0)
			topicsFilter +=',' + topicsMap[item]
		else
			topicsFilter = topicsMap[item]
	})		

	if (topicsFilter.length > 0) { 
		newTitle += ' <small>about</small> ' + topicsFilter
		queryString += 'topics=' + topicsFilter + '&'
	}

	if (provincesFilter.length > 0) {
		var locationsLabel = provincesFilter.replace('not set', '<small>unknown location</small>')
			, provincesFiltersArray = beChart.filters()

		if (provincesFiltersArray.length == 5) {
		// override list of provinces in case whole region is selected
			if (_.indexOf(provincesFiltersArray, 'Antwerp') != -1 && _.indexOf(provincesFiltersArray, 'Flemish Brabant') != -1 && _.indexOf(provincesFiltersArray, 'East Flanders') != -1 && _.indexOf(provincesFiltersArray, 'West Flanders') != -1 && _.indexOf(provincesFiltersArray, 'Limburg') != -1) {
				locationsLabel = 'Flanders'
			}
			else if (_.indexOf(provincesFiltersArray, 'Hainaut') != -1 && _.indexOf(provincesFiltersArray, 'Walloon Brabant') != -1 && _.indexOf(provincesFiltersArray, 'Liege') != -1 && _.indexOf(provincesFiltersArray, 'Namur') != -1 && _.indexOf(provincesFiltersArray, 'Luxembourg') != -1) {
				locationsLabel = 'Wallonia'
			}
		}
		newTitle += ' <small>from</small> ' + locationsLabel
		queryString += 'locations=' + provincesFilter + '&'
	}
	
	if (languagesFilter.length > 0) {
		newTitle += '<small> tweeting in ' + languagesFilter + '</small>'
		queryString += 'languages=' + languagesFilter
	}
		
	if (topicsFilter.length == 0 && provincesFilter.length == 0 && languagesFilter.length== 0) {
		newTitle += ' in Belgium by topic, location and language'
	}
	
	// this updates the title in page (h1)	
	$inPageTitle.html(newTitle)
	
	// this updates the page url and title meta tag
	History.pushState(null, newTitle.replace(/(<small>|<\/small>)/g,''), queryString)
}

//Split functions
function getRemoteData(){
	d3.json('json/users.json/search', function (data) {
		allTwittos = data
		renderAll(allTwittos)
	})
}

function renderAll(data){

// TODO: make server return numeric data type instead of string
	// feed it through crossfilter
	var ndx = crossfilter(data.tw_user)

	all = ndx.groupAll()

	// Solution based on
	// http://stackoverflow.com/questions/17524627/is-there-a-way-to-tell-crossfilter-to-treat-elements-of-array-as-separate-
	// Strange... Even if I replace the IDs with their values, when I ask the values from the reduce functions, I still get IDs...
	
	var topicsDimension = ndx.dimension(function(d){

		var topics = d[4].split(',')

		return topics
	});

	var topicsGroup = topicsDimension.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value();

	// hack to make dc.js charts work
	topicsGroup.all = function() {
		var newObject = [];
		for (var key in this) {
			if (this.hasOwnProperty(key) && key != "all") {
				newObject.push({
					key: key,
					value: this[key]
				});
			}
		}
		return newObject;
	}

	// Reduce functions to be used by topicsGroup
	function reduceAdd(p, v) {
		var topics = v[4].split(',')

		_.forEach (topics, function(val, idx) {
			p[val] = (p[val] || 0) + 1; //increment counts
		})
		return p
	}

	function reduceRemove(p, v) {
		var topics = v[4].split(',')
		 
		_.forEach (topics, function(val, idx) {
			p[val] = (p[val] || 0) - 1; // decrement counts
		}) 
		return p
	}

	function reduceInitial() {
		return {}
	}

	var provincesDimension = ndx.dimension(function (d) {
		// lookup province name from province id
		return provincesMap[d[2]]
	})
	provincesGroup = provincesDimension.group()

	var languagesDimension = ndx.dimension(function (d) {
// grouping other languages
		return languagesMap[d[1]] || 'Other'
	})

	var languagesGroup = languagesDimension.group()

	topicsChart.width(300)
		.height(250)
		.margins({top: 5, left: 10, right: 10, bottom: 20})
		.group(topicsGroup)
		.dimension(topicsDimension)
		.label(function(d) { return topicsMap[d.key] })
		.title(function(d){return d.value + ' twittos'})
		.colors(["#71c837"])
		.elasticX(true)
		.filterHandler(function(dimension, filter){
			dimension.filter(function(d) {
				var found = false
				//if there are no filters, return true
				if (topicsChart.filters().length == 0){
					return true
				} else {
					_.each(topicsChart.filters(), function(curfilter) {
						if (d.indexOf(curfilter) != -1){
							found = true
						}
					})
					return found
				}
			})
			return filter
		})
		.xAxis().ticks(4)

	beChart.width(300)
		.height(200)
		.dimension(provincesDimension)
		.group(provincesGroup)
		.colors(['#c6e9af', '#aade87', '#8dd35f', '#71c837', '#5aa02c', '#447821'])
		.projection(projection)
		.overlayGeoJson(provinces.features, 'state', function (d) {
			return d.properties.name
		})
		.title(function (d) {
			return d.key + '\n' + (d.value ? d.value : 0) + ' twittos'
		})

	languagesChart.width(300)
		.height(200)
		.margins({top: 20, left: 10, right: 10, bottom: 20})
		.group(languagesGroup)
		.dimension(languagesDimension)
		.title(function(d){return d.value + ' twittos'})
		.colors(["#71c837"])
		.elasticX(true)
		.xAxis().ticks(4)

	$('.placeholder').remove()
		
	dc.renderAll()

	var userDetailsXHR // ajax request querying for user details
		, twids = []
		, ajaxErrCount = 0
		, xHRRunning = false

	//https://datatables.net/
	function updateDataTable() {
		if (xHRRunning) {
			// abort previous userDetailsXHR in case is still running
			userDetailsXHR.abort()
		}
		xHRRunning = true
		// get user details

		userDetailsXHR = $.ajax({
			url : "/json/userDetails/" + twids.join(",")
			, dataType : 'json'
			, success : function(data, status, jqXHR) {
				$.each(data, function(index, item) {
					// update data table content
					$('#pic-' + index).attr('src', item.profile_image_url)
					$('#name-' + index).html(item.name)
					$('#desc-' + index).html(item.description)
					// add user details to cache
					twittosDetails[index] = {
						name : item.name
						, description : item.description
						, profile_image_url: item.profile_image_url
						, cached: true
					}
				})
				twids = []
				ajaxErrCount = 0
			}
			, error : function(jqXHR, err) {
				xHRRunning = false
				if (err != 'abort') {
					console.log('dataTables update error', err)
					ajaxErrCount++
					if (ajaxErrCount < 2) {
						console.log('reattempting...')
						updateDataTable()
					}
				}
			}
		})
	}

	function addNextPageData(twids) {
		if (pageSliceIndex < fdata.length) {
			dataTable.fnAddData(fdata.slice(pageSliceIndex+1, Math.min(pageSliceIndex+11, fdata.length)), false)
			pageSliceIndex = Math.min(pageSliceIndex+11, fdata.length)
			// launch a redraw keeping current pagination info (plugin)
			dataTable.fnStandingRedraw()
		}
	}

	// Check if datatable is initialized
	// Followed the documentation http://datatables.net/api
	var ex = document.getElementById('twitter-datatable')
	if ( ! $.fn.DataTable.fnIsDataTable( ex ) ) {
		dataTable = $('#twitter-datatable').dataTable( {
			"sDom": "t<'row-fluid'<'span6 pull-right'p>"
			, "sAjaxDataProp": ""
			, "bDeferRender": true //speed  http://datatables.net/ref#bDeferRender
			, "aaData": [	]
			, "asStripeClasses": [ ]
			, "iDisplayLength": 10
			, "sPaginationType": "bootstrap"
			, "aaSorting": [[ 3, "desc" ]]
			, "fnDrawCallback": function( oSettings ) {
				var pagination = this.fnPagingInfo()

				if (pagination.iTotalPages > 0 && pagination.iPage >= pagination.iTotalPages - 2 && twids.length != 0) {
					// add data to dataTables as we are getting close to the current last page of the subset sent to dataTables
					addNextPageData(twids)
					updateDataTable()
				}
				else if(twids.length != 0){
					// update row
					updateDataTable()
				}

			}
			, "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
				// identify users not yet cached, for which we should retrieve details via ajax call.
				if (!twittosDetails[aData[0]].cached) {
					twids.push(aData[0])
				}
			}
// TODO: investigate way to remove all unnecessary columns from the dataset (indices 0 to 5)
// will require reformating of fData and aData variables
			, "aoColumnDefs": [
				{ "sTitle": "Tw ID", "aTargets": [ 0 ], "bVisible": false, "bSearchable": false, "bSortable": false }
				, {
					"sTitle": "Rank"
					, "fnRender": function ( oObj ) {
						return '<p class="tw_rank">' + oObj.aData[6] + '</p>'
					}
					, "aTargets": [ 1 ]
					, "bSearchable": false
					, "bSortable": false
					, "sWidth": "5%"
				}
				, { "sTitle": "Klout Score", "aTargets": [ 3 ], "bVisible": false, "bSearchable": false }
				, {
					'sTitle': '<a href="http://klout.com" target="_blank"><img src="../assets/img/klout-logo.png"/></a>'
					, "fnRender": function ( oObj ) {
						if (! twittosDetails[oObj.aData[0]]) {
							// create empty details object in case it does not exist yet.
							twittosDetails[oObj.aData[0]] = {}
						}
						var profileHTML = ''
							+ '<div class="media">'
							+ '<div class="pull-left media-object">'
							+ '<a class="klout" target="_blank" title="' + oObj.aData[5] + '\'s Klout score" alt="' + oObj.aData[5] + '\'s profile picture" href="http://klout.com/user/' + oObj.aData[5] + '">'
							+ oObj.aData[3]
							+ '</a>'
							+ '<a target="_blank" href="https://www.twitter.com/' + oObj.aData[5] + '">'
							+ '<img width="48" height="48" id="pic-' + oObj.aData[0] + '" title="profile pic" alt="profile pic" class="img-rounded size48" src="' + (twittosDetails[oObj.aData[0]].profile_image_url || 'http://placehold.it/48&text=loading...') + '">'
							+ '</a>'
							+ '</div>'
							+ '<div class="media-body">'
							+ '<h4 class="media-heading" id="name-' + oObj.aData[0] + '">' + (twittosDetails[oObj.aData[0]].name || '') + '</h4>'
							+ '<a target="_blank" href="https://www.twitter.com/' + oObj.aData[5] + '">@' + oObj.aData[5] + '</a>'
							+ '</div>'
							+ '</div>'
						return profileHTML
					}
					, "aTargets": [ 2 ]
					, "bSearchable": false
					, "bSortable": false
					, "sWidth": "30%"
				}
				, {
					"sTitle": "Description"
					, "fnRender": function ( oObj ) {
						return '<p id="desc-' + oObj.aData[0] + '">' + (twittosDetails[oObj.aData[0]].description || '') + '</p>'
					}
					, "aTargets": [ 4 ]
					, "bSearchable": false
					, "bSortable": false
					, "sWidth": "65%"
				}
				, { "sTitle": "Screen Name", "aTargets": [ 5 ],"bVisible": false, "bSearchable": false, "bSortable": false }
			]
		} )
	}// End check if datatable is initialized

	filteredData = languagesDimension;
	
	filterData(urlFilters)
	
	// debouncing resize event based on http://stackoverflow.com/questions/5489946/jquery-how-to-wait-for-the-end-or-resize-event-and-only-then-perform-an-ac
	var rtime = new Date(1, 1, 1970, 12,00,00)
		, timeout = false
		, delta = 200
	$(window).on("resize", function() {
		rtime = new Date()
		if (timeout === false) {
			timeout = true
			setTimeout(resizeend, delta)
		}
	})
	function resizeend() {
		if (new Date() - rtime < delta) {
			setTimeout(resizeend, delta)
		} else {
			timeout = false
			resized = true
			dc.redrawAll()
		}
	}
	
} //renderAll END

// You might be wondering why I do this on postRedraw and not on filtered
// Cause filtered only fires when we set a filter and not when we unset
topicsChart.on('postRedraw', function(chart){
	filterData(null)
})

// setup chart responsiveness
topicsChart.on("preRedraw", function(chart) {
	var newWidth = $('#topics-chart').width()
	chart.select('svg')
		.attr('width', newWidth )
		.attr('height', newWidth * 25 / 30  )
		.attr('viewBox', '0 0 300 250')
		.attr('preserveAspectRatio', 'xMinYMin')
	historyPushState()
})

//beChart.renderlet(function(chart){
beChart.on("preRedraw", function(chart){
// setup chart responsiveness
	var newWidth = $('#be-chart').width()
	chart.select('svg')
		.attr('width', newWidth)
		.attr('height', newWidth * 2 / 3 )
		.attr('viewBox', '0 0 300 200')
		.attr('preserveAspectRatio', 'xMinYMin')
	// adapt containers' height
	$('#be-chart').height(newWidth * 2 / 3 + 30)
})

//languagesChart.renderlet(function(chart){
languagesChart.on("preRedraw", function(chart){
// setup chart responsiveness
	var newWidth = $('#languages-chart').width()
	chart.select('svg')
		.attr('width', newWidth )
		.attr('height', newWidth * 2 / 3 )
		.attr('viewBox', '0 0 300 200')
		.attr('preserveAspectRatio', 'xMinYMin')
	// adapt containers' height
	$('#languages-chart').height(newWidth * 2 / 3 + 30)
})


$(function() {
	blockPage(' loading ... ')
	getRemoteData()
})

function blockPage(msg) {
	$.blockUI({
		message: '<h1><img src="../assets/img/twitto_be-0.4.0-square-logo-40x40.png" />' + msg + '</h1>'
		, overlayCSS:  { cursor: 'wait'}
	})
	
}

function shareUrls(twittos) {
	var currentUrl = History.getState().url
		, shareUrl = ''
		, shareText = ''
		, shareVia = 'twitto_be'
		, shareHashtags = 'twittoBe'
		, topThreeText = ''
		, shareTitle = 'top twitter influencers in Belgium by topic, location and language - Twitto.be'
	
	shareUrl = History.getState().url
	
	_.forEach(twittos, function(val, idx){
		twittos[idx] = '@' + val
	})
	
	shareText = twittos.join(', ') + ' are in the ranking of top Belgian twittos'

	//Twitter
	shareUrl = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(currentUrl.replace(' ', '+')) + 
		'&text=' + encodeURIComponent(shareText) + '&via=' + encodeURIComponent(shareVia) + 
		'&hashtags=' + encodeURIComponent(shareHashtags)
	$shareTwitter.attr('href', shareUrl)
	
	//Google Plus
	shareUrl = 'https://plus.google.com/share?url=' + encodeURIComponent(currentUrl.replace(' ', '+'))
	$shareGoogle.attr('href', shareUrl)
	
	//Facebook
	shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(currentUrl.replace(' ', '+'))
	$shareFacebook.attr('href', shareUrl)

	//Linkedin
	shareUrl = 'http://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(currentUrl	.replace(' ', '+')) +
		'&title=' + encodeURIComponent(shareTitle) +  '&summary=' + encodeURIComponent(shareText) + 
		'&source' + encodeURIComponent(shareVia)
	$shareLinkedin.attr('href', shareUrl)

}

</script>
@stop
