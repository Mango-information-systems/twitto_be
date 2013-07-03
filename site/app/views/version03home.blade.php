@extends('_layouts.version03')
@section('main')
<div class="row-fluid">
	<div id="myGrid" style="width:100%;height:500px;"></div>
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
Belgian users of twitter, categorized and ranked by their Kred influence score
@stop


@section('inline-javascript')
	var grid;
	var columns = [
		{id: "rank", name: "Rank", field: "rank"},
		{id: "profile_picture", name: "Profile Picture", field: "profile_image_url", formatter: Slick.Formatters.Image},
		{id: "name_username", name: "Name @username", field: "name"},
		{id: "description", name: "Description", field: "description"},
		{id: "main_category", name: "Main Category", field: "category_name"},
		{id: "kred_score", name: "Kred Score", field: "kred_score"}
	];

	var options = {
		enableCellNavigation: true,
		enableColumnReorder: false,
		rowHeight: 55,
fullWidthRows: true,
forceFitColumns: true
	};

	$(function () {
		var data = [];
		for (var i = 0; i < 500; i++) {
			data[i] = {
				rank: "Task " + i,
				profile_image_url: "5 days",
				name: Math.round(Math.random() * 100),
				description: "01/01/2009",
				category_name: "01/05/2009",
				kred_score: (i % 5 == 0)
			};
		}

var skata = <?php echo $users_json; ?>;

		grid = new Slick.Grid("#myGrid", skata, columns, options);

	})
@stop
