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

	d3.csv("tw_user.csv", function (data) {
			var new_data = []
			data.forEach(function (e){
				if (e.main_category_id != "-1") {
					new_data.push(e);
				}
			});

			data = new_data;

			// feed it through crossfilter
			var ndx = crossfilter(data);
			var all = ndx.groupAll();

			var categories = ndx.dimension(function (d) {
				var category = d.main_category_id;
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
				return d.lang;
			});

			var languagesGroup = languages.group();

			console.log(languagesGroup.all());

			categoriesChart.width(400)
				.height(400)
				.margins({top: 20, left: 10, right: 10, bottom: 20})
				.group(categoriesGroup)
				.dimension(categories)
				.colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
				.title(function(d){return d.value;})
				.elasticX(true)
				.xAxis().ticks(4);

			languagesChart.width(400)
				.height(400)
				.margins({top: 10, right: 50, bottom: 30, left: 40})
				.dimension(languages)
				.group(languagesGroup)
				.elasticY(true)
				.gap(1)
				.round(dc.round.floor)
				.x(d3.scale.linear().domain([-25, 25]))
				.renderHorizontalGridLines(true)
				.xAxis();

		dc.renderAll();

	}
);

</script>


@stop
