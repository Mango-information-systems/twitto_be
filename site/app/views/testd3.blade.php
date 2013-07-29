@extends('_layouts.default')
@section('main')

<div class="row-fluid">
	<div id="categories-chart">
		<strong>Categories Chart</strong>
		<a class="reset" href="javascript:categoriesChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>

		<div class="clearfix"></div>
	</div>

	<div id="languages-chart">
		<strong>Languages Chart</strong>
		<a class="reset" href="javascript:languagesChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>

		<div class="clearfix"></div>
	</div>

</div>
<div class="row-fluid">
<table cellpadding="0" cellspacing="0" border="0" class="dataTable" id="twitter-datatable"></table>
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
	var categoriesChart = dc.rowChart("#categories-chart");
	var languagesChart = dc.barChart("#languages-chart");

	var dt;
	var filteredData;

	function filterData(){
		var newDataArray = new Array;

		$('#twitter-datatable').dataTable().fnClearTable();
		$('#twitter-datatable').dataTable().fnAddData(filteredData.top(Infinity));
		$('#twitter-datatable').dataTable().fnDraw();
	}


	categoriesChart.on("postRedraw", function(chart, filter){
		filterData();
	});



	d3.json("tw_user.json", function (data) {
			var new_data = [];
			/*
			data.forEach(function (e){
				if (e.main_category_id != "-1") {
					new_data.push(e);
				}
			});
*/
			data = data.tw_user;

			// feed it through crossfilter
			var ndx = crossfilter(data);
			var all = ndx.groupAll();

			var categories = ndx.dimension(function (d) {
				var category = d[2];
				switch(category){
					case "1":
						return "Bloggers"
						break;
					case "2":
						return "Communication"
						break;
					case "3":
						return "Politics"
						break;
					case "4":
						return "Media"
						break;
					case "7":
						return "Startup"
						break;
					case "-1":
						return "Uncategorized"
						break;
				}
			});
			var categoriesGroup = categories.group();


			var languages = ndx.dimension(function (d) {
				return d[1];
			});
			var languagesGroup = languages.group();
			var languagesDomain = [""];

			languagesGroup.all().forEach(function (e){
				languagesDomain.push(e.key);
			});

			categoriesChart.width(400)
				.height(400)
				.margins({top: 20, left: 10, right: 10, bottom: 20})
				.group(categoriesGroup)
				.dimension(categories)
				.colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
				.title(function(d){return d.value;})
				.elasticX(true)
				.xAxis().ticks(4);

			languagesChart.width(800)
				.height(400)
				.dimension(languages)
				.group(languagesGroup)
				.elasticY(true)
				.centerBar(true)
				.x(d3.scale.ordinal().domain(languagesDomain))
				.xUnits(dc.units.ordinal);

			dc.renderAll();

			filteredData = languages;


			$('#twitter-datatable').dataTable( {
				"sAjaxDataProp": "",
				"bDeferRender": true, //speed  http://datatables.net/ref#bDeferRender
				"aaData": [	],
				"aoColumns": [
					{ "sTitle": "Screen Name" },
					{ "sTitle": "Lang" },
					{ "sTitle": "Category" }
				]
			} );

			// Keep the following disabled so that we actually see the difference between
			// just rendering the charts and how much time the datatable takes to load

			filterData();
		}
);

</script>




@stop
