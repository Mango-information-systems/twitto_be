@extends('_layouts.default')
@section('main')
<div id="scrolltop">&nbsp;</div>
<div class="row-fluid">
	<div id="topics-chart">
		<strong>Topics Chart</strong>
		<a class="reset" href="javascript:topicsChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>

		<div class="clearfix"></div>
	</div>

	<div id="languages-chart">
		<strong>Languages Chart</strong>
		<a class="reset" href="javascript:languagesChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>

		<div class="clearfix"></div>
	</div>

</div>
<div class="row-fluid">
	<table class="table table-striped table-bordered" id="twitter-datatable" border="0" cellpadding="0" cellspacing="0" width="100%"></table>
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

<script type="text/javascript">
var topicsChart = dc.rowChart("#topics-chart")
	, languagesChart = dc.barChart("#languages-chart")
	, dataTable // cached selector of datatable
	, pageSliceIndex // index to add next page to the data table
	, filteredData // full dataset (crossfilter dimension)
	, fdata // top infinity of filteredData
	, twittosDetails = {} // all twittos for which details have already been extracted
	, topics

function filterData(urlFilter){
// crossfilter data

	fdata = filteredData.top(Infinity);
	var scores = [];

	if(urlFilter != null){
	// filter based on url params
		if(urlFilter['topics'][0] != ''){
			urlFilter['topics'].forEach(function(d){
				topicsChart.filter(d);
			});
		}

		if(urlFilter['area'][0] != ''){
			urlFilter['area'].forEach(function(d){
				//areaChart.filter(d);
			});
		}

		if(urlFilter['languages'][0] != ''){
			urlFilter['languages'].forEach(function(d){
				languagesChart.filter(d);
			});
		}

		topicsChart.redraw();
		languagesChart.redraw();

		return;
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

topicsChart.on("preRedraw", function(chart){
	var topicsFilter = topicsChart.filters().join(",");
	var languagesFilter = languagesChart.filters().join(",");
	History.pushState(null, null, "?topics="+topicsFilter+"&languages="+languagesFilter); // logs {state:1}, "State 1", "?state=1"
});
topicsChart.on("postRedraw", function(chart){
	filterData(null);
});

d3.json("json/users.json", function (data) {
// TODO: make server return numeric data type instead of string
		var newData = []

		data.tw_user.forEach(function (e){
			// add dummy columns for datatable rendering
			newData.push(e.concat(['', '', '']))
			// initialize cache object
			twittosDetails[e[0]] = {}
		})

		/*
		 data.tw_user.forEach(function (e){
		 if (
		 e[4] == "745" ||
		 e[4] == "1654" ||
		 e[4] == "1362" ||
		 e[4] == "1387" ||
		 e[4] == "2499" ||
		 e[4] == "2527" ||
		 e[4] == "240" ||
		 e[4] == "2668" ||
		 e[4] == "2095" ||
		 e[4] == "895" ) {
		 newData.push(e);
		 }
		 })*/

		data = newData

		// feed it through crossfilter
		var ndx = crossfilter(data)

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
		var topicsGroup = topicsDimension.group();

		var languagesDimension = ndx.dimension(function (d) {
			var lang = d[1]
			switch(lang){
				case "en":
					return "en"
				break
				case "nl":
					return "nl"
				break
				case "fr":
					return "fr"
				break
				default :
					return "ot"
				break
			}
		});
		var languagesGroup = languagesDimension.group();
		
		var languagesDomain = [""];

		languagesGroup.all().forEach(function (e){
			languagesDomain.push(e.key);
		});

		topicsChart.width(400)
			.height(400)
			.margins({top: 20, left: 10, right: 10, bottom: 20})
			.group(topicsGroup)
			.dimension(topicsDimension)
			.colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
			.title(function(d){return d.value;})
			.elasticX(true)
			.xAxis().ticks(4);

		languagesChart.width(800)
			.height(400)
			.dimension(languagesDimension)
			.group(languagesGroup)
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
			"sDom": "<'row-fluid'<'span6'T><'span6'p>r>t<'row-fluid'<'span6'i><'span6'p>",
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
				, { "sTitle": "Lang", "aTargets": [ 1 ], "bVisible": false, "bSearchable": false, "bSortable": false }
				, { "sTitle": "Province ID", "aTargets": [ 2 ], "bVisible": false, "bSearchable": false, "bSortable": false }
				, { "sTitle": "Klout Score", "aTargets": [ 3 ], "bVisible": false, "bSearchable": false }
				, { "sTitle": "Topic ID", "aTargets": [ 4 ], "bVisible": false, "bSearchable": false, "bSortable": false }
				, { "sTitle": "Screen Name", "aTargets": [ 5 ],"bVisible": false, "bSearchable": false, "bSortable": false }
				, {
					"sTitle": "Rank"
					, "fnRender": function ( oObj ) {
						return '<p class="lead">' + oObj.aData[6] + '</p>'
					}
					, "aTargets": [ 6 ]
					, "bSearchable": false
					, "bSortable": false
					, "sWidth": "5%"
				}
				, {
					"sTitle": "Profile"
					, "fnRender": function ( oObj ) {
						var profileHTML = ''
							+ '<div class="media">'
							+ '<div class="pull-left media-object">'
							+ '<a class="klout" target="_blank" title="' + oObj.aData[5] + '\'s Klout score" alt="' + oObj.aData[5] + '\'s profile picture" href="http://klout.com/' + oObj.aData[5] + '">'
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
					, "aTargets": [ 7 ]
					, "bSearchable": false
					, "bSortable": false
					, "sWidth": "25%"
				}
				, {
					"sTitle": "Description"
					, "fnRender": function ( oObj ) {
						return '<p id="desc-' + oObj.aData[0] + '">' + (twittosDetails[oObj.aData[0]].description || '') + '</p>'
					}
					, "aTargets": [ 8 ]
					, "bSearchable": false
					, "bSortable": false
					, "sWidth": "70%" 
				}
			]
		} );

		filteredData = languagesDimension;

		// Keep the following disabled so that we actually see the difference between
		// just rendering the charts and how much time the datatable takes to load

		var urlFilters = [];
		urlFilters['topics'] = "<?php echo $filters['topics']; ?>";
		urlFilters['topics'] = urlFilters['topics'].split(",");
		urlFilters['area'] = "<?php echo $filters['area']; ?>";
		urlFilters['area'] = urlFilters['area'].split(",");
		urlFilters['languages'] = "<?php echo $filters['languages']; ?>";
		urlFilters['languages'] = urlFilters['languages'].split(",");
		filterData(urlFilters);

	}
);

</script>
@stop
