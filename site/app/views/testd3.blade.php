@extends('_layouts.default')
@section('main')

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
About
@stop



@section('sidebar')
@include('sidebar')
@stop



@section('inline-javascript')

<script type="text/javascript">
	var topicsChart = dc.rowChart("#topics-chart");
	var languagesChart = dc.barChart("#languages-chart");

	var dt;
	var filteredData;

	var topics;

	function filterData(){

		var fdata = filteredData.top(Infinity);
		var scores = [];

		$.each(filteredData.top(Infinity), function(index, value) {
			scores.push(fdata[index][3]);
		});

		var sorted = scores.slice().sort(function(a,b){return b-a});
		var ranks = scores.slice().map(function(v){ return sorted.indexOf(v)+1 });

		$.each(filteredData.top(Infinity), function(index, value) {
			fdata[index][6] = ranks[index];
		});

		$('#twitter-datatable').dataTable().fnClearTable();
		$('#twitter-datatable').dataTable().fnAddData(fdata);
		//$('#twitter-datatable').dataTable().fnDraw();
	}

	topicsChart.on("postRedraw", function(chart, filter){
		filterData();
	})

	/*
	d3.json("json/topics.json", function (data) {
		topics = data;
	});
	*/


	d3.json("json/users.json", function (data) {
			var new_data = [];

		data.tw_user.forEach(function (e){
			if(e[4] != '-1'){
				new_data.push(e);
			}
		});

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
					new_data.push(e);
				}
			});*/

			data = new_data;

			// feed it through crossfilter
			var ndx = crossfilter(data);
			var all = ndx.groupAll();

			var topicsDimension = ndx.dimension(function (d) {
				var topic = d[4].split(',');

				if(_.findWhere(topic, '745') ){
					return "Computers";

				}else if(_.findWhere(topic, '1654') ){
					return "Business"

				}else if(_.findWhere(topic, '1362') ){
					return "Software"

				}else if(_.findWhere(topic, '1387') ){
					return "Music"

				}else if(_.findWhere(topic, '2499') ){
					return "Belgium"

				}else if(_.findWhere(topic, '2527') ){
					return "Movies"

				}else if(_.findWhere(topic, '240') ){
					return "Studio Brussels"

				}else if(_.findWhere(topic, '2668') ){
					return "Social Media"

				}else if(_.findWhere(topic, '2095') ){
					return "Journalism"

				}else if(_.findWhere(topic, '895') ){
					return "Design"
				}else{
					return "Other";
				};

			});
			var topicsGroup = topicsDimension.group();


			var languagesDimension = ndx.dimension(function (d) {
				var lang = d[1];
				switch(lang){
					case "en":
						return "en"
						break;
					case "nl":
						return "nl"
						break;
					case "fr":
						return "fr"
						break;
					default :
						return "ot"
						break;
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

			$('#twitter-datatable').dataTable( {
				"sDom": "<'row-fluid'<'span6'T><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
				"sAjaxDataProp": "",
				"bDeferRender": true, //speed  http://datatables.net/ref#bDeferRender
				"aaData": [	],
				"sPaginationType": "bootstrap",
				"aaSorting": [[ 3, "desc" ]],
				"fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
					var jqxhr = $.ajax({
						url: "/json/userDetails/" + aData[0],
						async: false

					});

					var json = JSON.parse(jqxhr.responseText);
					var imgTag = '<img src="' + json.profile_image_url + '"/>';

					var profileHTML = '' +
						'<div class="media">' +
						'<a target="_blank" href="https://www.twitter.com/'+json.screen_name+'" class="pull-left">' +
						'<img width="48" height="48" title="'+json.name+'" alt="'+json.name+'" class="img-rounded media-object size48" src="'+json.profile_image_url+'">' +
						'</a>' +
						'<div class="media-body">' +
						'<h4 class="media-heading">'+json.name+'</h4>' +
						'<a target="_blank" href="https://www.twitter.com/'+json.screen_name+'">@'+json.screen_name+'</a>' +
						'</div>' +
						'</div>';


					$('td:eq(1)', nRow).html(profileHTML); // where 4 is the zero-origin visible column in the HTML
					$('td:eq(2)', nRow).html(json.description); // where 4 is the zero-origin visible column in the HTML
					$('td:eq(3)', nRow).html(json.name); // where 4 is the zero-origin visible column in the HTML



					return nRow;
				},
				"aoColumnDefs": [
					{ "sTitle": "Tw ID", "aTargets": [ 0 ], "bVisible": false, "bSearchable": false, "bSortable": false },
					{ "sTitle": "Lang", "aTargets": [ 1 ], "bVisible": false, "bSearchable": false, "bSortable": false },
					{ "sTitle": "Province ID", "aTargets": [ 2 ], "bVisible": false, "bSearchable": false, "bSortable": false },
					{ "sTitle": "Klout Score", "aTargets": [ 3 ], "bVisible": false, "bSearchable": false },
					{ "sTitle": "Topic ID", "aTargets": [ 4 ], "bVisible": false, "bSearchable": false, "bSortable": false },
					{ "sTitle": "Screen Name", "aTargets": [ 5 ],"bVisible": false, "bSearchable": true, "bSortable": false },
					{ "sTitle": "Rank", "aTargets": [ 6 ], "bSearchable": false, "bSortable": false },
					{ "sTitle": "Profile", "aTargets": [ 7 ], "bSearchable": false, "bSortable": false },
					{ "sTitle": "Description", "aTargets": [ 8 ], "bSearchable": false, "bSortable": false  }
				]
			} );

			filteredData = languagesDimension;

			// Keep the following disabled so that we actually see the difference between
			// just rendering the charts and how much time the datatable takes to load

			filterData();

		}
);

</script>



@stop
