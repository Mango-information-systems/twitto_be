@extends('_layouts.version03')
@section('main')
<div id="myGrid" style="width:100%;height:500px;"></div>
<button id="loadmore" class="btn btn-large">Load more...</button>
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

	dataView = new Slick.Data.DataView({ inlineFilters: true });


	$(function () {
		var data = <?php echo $users_json; ?>;

		dataView = new Slick.Data.DataView({ inlineFilters: true });
		grid = new Slick.Grid("#myGrid", dataView, columns, options);
		dataView.beginUpdate();
		dataView.setItems(data);
		dataView.endUpdate();
		grid.render();


		// wire up model events to drive the grid
		dataView.onRowCountChanged.subscribe(function (e, args) {
			grid.updateRowCount();
			grid.render();
		});

		dataView.onRowsChanged.subscribe(function (e, args) {
			grid.invalidateRows(args.rows);
			grid.render();
		});

		// When user clicks button, fetch data via Ajax, and bind it to the dataview.
		$('#loadmore').click(function() {
			$.getJSON('/users/page/2', function(data) {
				dataView.beginUpdate();
				dataView.setItems(data);
				dataView.endUpdate();
			});
		});

	})
@stop
