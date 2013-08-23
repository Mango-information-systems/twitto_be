@extends('_layouts.default')
@section('main')
<div id="scrolltop">&nbsp;</div>
<div class="row-fluid">
	<div class="span2">
		<div id="topics-chart" class="span12">
			<strong>Topics filters</strong>
			<a class="reset" href="javascript:topicsChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>

			<div class="clearfix"></div>
		</div>
	</div>
	<div class="span8">
		<div class="row-fluid">
			<div id="be-chart" class="span4">
				<p><strong>Provinces filters</strong></p>
				<a class="reset" href="javascript:beChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
				<span class="reset" style="display: none;"> | Current filter: <span class="filter"></span></span>

				<div class="clearfix"></div>
			</div>
			
			<div id="languages-chart" class="span4">
				<strong>Languages filters</strong>
				<a class="reset" href="javascript:languagesChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>

				<div class="clearfix"></div>
			</div>
		</div>
		<div class="row-fluid">
			<table class="table table-striped table-bordered" id="twitter-datatable" border="0" cellpadding="0" cellspacing="0" width="100%"></table>
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
	
	, projection = d3.geo.mercator()
		.center([5, 48.9])
		.scale(700 * 6)
// TODO: dynamically set width and height according to chart dimensions
		.translate([370 / 2, 300])
    , topicsChart = dc.rowChart("#topics-chart")
	, beChart = dc.geoChoroplethChart("#be-chart")
	, languagesChart = dc.barChart("#languages-chart")
	, dataTable // cached selector of datatable
	, pageSliceIndex // index to add next page to the data table
	, filteredData // full dataset (crossfilter dimension)
	, fdata // top infinity of filteredData
	, twittosDetails = {} // cache of all twittos for which details have already been extracted
	, topics
	, provincesGroup

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
	
}

topicsChart.on('preRedraw', function(chart){
	var topicsFilter = topicsChart.filters().join(',')
	, provincesFilter = beChart.filters().join(',')
	, languagesFilter = languagesChart.filters().join(',')
	History.pushState(null, null, '?topics=' + topicsFilter + '&locations=' + provincesFilter + '&languages=' + languagesFilter)
	beChart.colorDomain([0, provincesGroup.top(1)[0].value])
})
topicsChart.on('postRedraw', function(chart){
	filterData(null)
})

d3.json('json/users.json', function (data) {
// TODO: make server return numeric data type instead of string

		// feed it through crossfilter
		var ndx = crossfilter(data.tw_user)

		var all = ndx.groupAll()

		var topicsDimension = ndx.dimension(function (d) {
			var topic = d[4].split(',')

			if(topic.indexOf('745') != -1 ){
				return "Computers"

			}else if(topic.indexOf('1654') != -1 ){
				return "Business"

			}else if(topic.indexOf('1362') != -1 ){
				return "Software"

			}else if(topic.indexOf('1387') != -1 ){
				return "Music"

			}else if(topic.indexOf('2499') != -1 ){
				return "Belgium"

			}else if(topic.indexOf('2527') != -1 ){
				return "Movies"

			}else if(topic.indexOf('240') != -1 ){
				return "Studio Brussels"

			}else if(topic.indexOf('2668') != -1 ){
				return "Social Media"

			}else if(topic.indexOf('2095') != -1 ){
				return "Journalism"

			}else if(topic.indexOf('895') != -1 ){
				return "Design"
				
			}else{
				return "Other"
			}

		})
		var topicsGroup = topicsDimension.group()

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
			.height(300)
			.margins({top: 20, left: 10, right: 10, bottom: 20})
			.group(topicsGroup)
			.dimension(topicsDimension)
			.title(function(d){return d.value + ' twittos'})
			.elasticX(true)
			.xAxis().ticks(4)

		beChart.width(300)
				.height(300)
				.dimension(provincesDimension)
				.group(provincesGroup)
				.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
				.projection(projection)
				.overlayGeoJson(provinces.features, 'state', function (d) {
					return d.properties.name
				})
				.title(function (d) {
					return d.key + '\n' + (d.value ? d.value : 0) + ' twittos'
				})

		languagesChart.width(400)
			.height(300)
			.margins({top: 10, right: 50, bottom: 30, left: 45})
			.dimension(languagesDimension)
			.group(languagesGroup)
			.title(function(d){return d.value + ' twittos'})
			.elasticY(true)
			.centerBar(true)
			.x(d3.scale.ordinal().domain(languagesDomain))
			.xUnits(dc.units.ordinal);

		dc.renderAll();
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
		
		dataTable = $('#twitter-datatable').dataTable( {
			"sDom": "t<'row-fluid'<'span6 pull-right'p>",
			"sAjaxDataProp": "",
			"bDeferRender": true, //speed  http://datatables.net/ref#bDeferRender
			"aaData": [	],
			"sPaginationType": "bootstrap",
			"aaSorting": [[ 3, "desc" ]],
			"fnDrawCallback": function( oSettings ) {
				var pagination = this.fnPagingInfo()
				if (pagination.iTotalPages > 0 && pagination.iPage >= pagination.iTotalPages - 2) {
					// add data to dataTables as we are getting close to the current last page of the subset sent to dataTables
					addNextPageData(twids)
				}
				else if(twids.length != 0){
					// update row
					updateDataTable()
				}

			},
			"fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
				// identify users not yet cached, for which we should retrieve details via ajax call.
				if (!twittosDetails[aData[0]].cached) {
					twids.push(aData[0])
				}
			},
// TODO: investigate way to remove all unnecessary columns from the dataset (indices 0 to 5)
// will require reformating of fData and aData variables
			"aoColumnDefs": [
					{ "sTitle": "Tw ID", "aTargets": [ 0 ], "bVisible": false, "bSearchable": false, "bSortable": false }
					, {
					"sTitle": "Rank"
					, "fnRender": function ( oObj ) {
						return '<p class="lead">' + oObj.aData[6] + '</p>'
					}
					, "aTargets": [ 1 ]
					, "bSearchable": false
					, "bSortable": false
					, "sWidth": "5%"
				}
				, { "sTitle": "Klout Score", "aTargets": [ 3 ], "bVisible": false, "bSearchable": false }
				, {
					"sTitle": "Profile"
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

		filteredData = languagesDimension;

		// Keep the following disabled so that we actually see the difference between
		// just rendering the charts and how much time the datatable takes to load

		var urlFilters = []
		urlFilters['topics'] = '<?php echo $filters['topics']; ?>'
		urlFilters['topics'] = urlFilters['topics'].split(',')
		urlFilters['locations'] = '<?php echo $filters['locations']; ?>'
		urlFilters['locations'] = urlFilters['locations'].split(',')
		urlFilters['languages'] = '<?php echo $filters['languages']; ?>'
		urlFilters['languages'] = urlFilters['languages'].split(',')
		filterData(urlFilters)

	}
);

</script>
@stop
