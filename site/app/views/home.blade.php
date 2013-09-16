@extends('_layouts.default')
@section('main')
<div id="scrolltop">&nbsp;</div>
<div class="row-fluid">
	<div class="span12">		
		<div class="row-fluid">
			<div class="span3" id="topics-chart">
				<strong>Topics filters</strong>
				<a class="reset" href="javascript:topicsChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>

				<div class="clearfix"></div>
			</div>
			<div class="span3" id="be-chart">
				<p><strong>Provinces filters</strong></p>
				<a class="reset" href="javascript:beChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
				<span class="reset" style="display: none;"> | Current filter: <span class="filter"></span></span>

				<div class="clearfix"></div>
			</div>
			
			<div class="span3" id="languages-chart">
				<strong>Languages filters</strong>
				<a class="reset" href="javascript:languagesChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>

				<div class="clearfix"></div>
			</div>
			
			<div class="span3">
				<p>
					<strong>Share</strong>
				</p>
			</div>
		</div>
		<div class="row-fluid">
			<div class="span10 offset1">
				<table class="table table-striped" id="twitter-datatable" border="0" cellpadding="0" cellspacing="0" width="100%"></table>
			</div>
		</div>
	</div>

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
		'-1' : 'Unassigned'
		, 1 : 'Belgium'
		, 2 : 'Business'
		, 3 : 'Design'
		, 4 : 'Entertainment'
		, 5 : 'Health'
		, 6 : 'Politics'
		, 7 : 'Sport'
		, 8 : 'Technology'
		, 9 : 'Media'
	}
	, projection = d3.geo.mercator()
		.center([5, 48.9])
		.scale(700 * 6)
// TODO: dynamically set width and height according to chart dimensions
		.translate([370 / 2, 300])
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

var urlFilters = []
urlFilters['topics'] = '<?php echo $filters['topics']; ?>'
urlFilters['topics'] = urlFilters['topics'].split(',')
urlFilters['locations'] = '<?php echo $filters['locations']; ?>'
urlFilters['locations'] = urlFilters['locations'].split(',')
urlFilters['languages'] = '<?php echo $filters['languages']; ?>'
urlFilters['languages'] = urlFilters['languages'].split(',')

function filterData(urlFilter){
// crossfilter data

	fdata = filteredData.top(Infinity);
	var scores = []

	if(urlFilter != null){
	// filter based on url params
		if(urlFilter['topics'][0] != ''){
			urlFilter['topics'].forEach(function(d){
				topicsChart.filter(d);
			})
		}

		if(urlFilter['locations'][0] != ''){
			urlFilter['locations'].forEach(function(d){
				beChart.filter(d)
			})
		}

		if(urlFilter['languages'][0] != ''){
			urlFilter['languages'].forEach(function(d){
				languagesChart.filter(d)
			})
		}

		topicsChart.redraw()
		languagesChart.redraw()
		beChart.redraw()

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

	dataTable.fnClearTable()
	pageSliceIndex = Math.min(50, fdata.length)
	dataTable.fnAddData(fdata.slice(0, pageSliceIndex))
	
	$.unblockUI()
	
}

function historyPushState(){
	//After every filter we need to refresh the chart to get the correct color range
	beChart.colorDomain([0, provincesGroup.top(1)[0].value])
	beChart.redraw()
	
	var topicsFilter = topicsChart.filters().join(',')
		, provincesFilter = beChart.filters().join(',')
		, languagesFilter = languagesChart.filters().join(',')
	History.pushState(null, null, '?topics=' + topicsFilter + '&locations=' + provincesFilter + '&languages=' + languagesFilter)
}

topicsChart.on('preRedraw', function(chart){
	historyPushState()
})
topicsChart.on('postRedraw', function(chart){
	filterData(null)
})

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

	var all = ndx.groupAll()

	// Solution based on
	// http://stackoverflow.com/questions/17524627/is-there-a-way-to-tell-crossfilter-to-treat-elements-of-array-as-separate-
	// Strange... Even if I replace the IDs with their values, when I ask the values from the reduce functions, I still get IDs...
	var topicsDimension = ndx.dimension(function(d){
		//var topics = d[4]

		var topics = d[4].split(',')
		
		topics.forEach (function(val, idx) {
			topics[idx] = topicsMap[val]
		})
				
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
		//var topics = v[4]
		
		var topicName = ''
		
		topics.forEach (function(val, idx) {
			//Add new entries with the text from the topicsMap, keep the rest - should be removed
			topicName = topicsMap[val]
			if(topicName != undefined){
				p[topicName] = (p[topicName] || 0) + 1 //increment counts
			}
		})
		 
		 /*
		topics.forEach (function(val, idx) {
			p[val] = (p[val] || 0) + 1; //increment counts
		})
	*/
		return p
	}

	function reduceRemove(p, v) {
		var topics = v[4].split(',')
		//var topics = v[4]
		var topicName = ''
	
		 topics.forEach (function(val, idx) {
			//Add new entries with the text from the topicsMap, keep the rest - should be removed
			topicName = topicsMap[val]
			if(topicName != undefined) {
			   p[topicName] = (p[topicName] || 0) - 1 //decrement counts
			}
		 
		 })
		 
/*
		topics.forEach (function(val, idx) {
			p[val] = (p[val] || 0) - 1; //increment counts
		})
	*/
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
		if (['en', 'fr', 'nl'].indexOf(d[1]) == -1 ) {
			d[1] = 'ot'
		}
		return languagesMap[d[1]]
	})
	var languagesGroup = languagesDimension.group()

	var languagesDomain = ['']

	languagesGroup.all().forEach(function (e){
		languagesDomain.push(e.key)
	})

	topicsChart.width(300)
		.height(250)
		.margins({top: 20, left: 10, right: 10, bottom: 20})
		.group(topicsGroup)
		.dimension(topicsDimension)
		.title(function(d){return d.value + ' twittos'})
		.colors(["#ffb380"])
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
		.height(300)
		.dimension(provincesDimension)
		.group(provincesGroup)
		.colors(["#ffe6d5", "#ffccaa", "#ffb380", "#ff9955", "#ff7f2a", "#ff6600", "#d45500", "#aa4400", "#803300", "#803300"])
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
		.colors(["#ffb380"])
		.elasticX(true)
		.xAxis().ticks(4)


	dc.renderAll()
	var xHR
		, twids = []
		, ajaxErrCount = 0
		, xHRRunning = false

	//https://datatables.net/
	function updateDataTable() {
		if (xHRRunning) {
			// abort previous xHR in case is still running
			xHR.abort()
		}
		xHRRunning = true
		// get user details

		xHR = $.ajax({
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
			, "iDisplayLength": 25
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
							+ '<img width="48" height="48" id="pic-' + oObj.aData[0] + '" title="' + oObj.aData[5] + '\'s profile picture" alt="' + oObj.aData[5] + '\'s profile picture" class="img-rounded size48" src="' + (twittosDetails[oObj.aData[0]].profile_image_url || 'http://placehold.it/48&text=loading...') + '">'
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
	
} //renderAll END

// renderlet function
topicsChart.renderlet(function(chart){
	// Select all rows of the topicsChart
	// and loopover them to replace the IDs with Topic names
	/*
	topicsRows = topicsChart.selectAll('text.row')
	topicsRows[0].forEach (function(val) {
		//textContent instead of innerHTML works for Chrome http://stackoverflow.com/questions/9602715/js-on-svg-getting-innerhtml-of-an-element
		val.textContent = topicsMap[val.__data__.key]
	})
	*/
	// Solution based on https://groups.google.com/forum/#!topic/dc-js-user-group/JsgSb9103Wg
	var newWidth = $('#topics-chart').width()
	chart.select('svg')
		.attr('width', newWidth )
		.attr('height', newWidth * 25 / 30  )
		.attr('viewBox', '0 0 300 250')
		.attr('preserveAspectRatio', 'xMinYMin')

})

beChart.renderlet(function(chart){
	var newWidth = $('#be-chart').width()
	chart.select('svg')
		.attr('width', newWidth)
		.attr('height', newWidth )
		.attr('viewBox', '0 0 300 300')
		.attr('preserveAspectRatio', 'xMinYMin')
	// adapt containers' height
	$('#be-chart').height(newWidth)
})

languagesChart.renderlet(function(chart){
	var newWidth = $('#languages-chart').width()
	chart.select('svg')
		.attr('width', newWidth )
		.attr('height', newWidth * 2 / 3 )
		.attr('viewBox', '0 0 300 200')
		.attr('preserveAspectRatio', 'xMinYMin')
	// adapt containers' height
	$('#languages-chart').height(newWidth * 2 / 3 + 10)
})

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
		dc.redrawAll()
	}
}

$(function() {
	blockPage(' Initializing ... ')
	getRemoteData()
})

function blockPage(msg) {
	$.blockUI({
		message: '<h1><img src="../assets/img/twitto_be-0.4.0-square-logo-40x40.png" />' + msg + '</h1>'
		, overlayCSS:  { backgroundColor: '#fff', opacity: 1, cursor: 'wait'}
	})
}

</script>
@stop