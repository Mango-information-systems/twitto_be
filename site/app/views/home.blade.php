@extends('_layouts.default')
@section('main')
<div id="scrolltop">&nbsp;</div>
<div id="twitter-datatable"></div>
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

{{-- topcategories --}}
@section('topcategories')
@include('topcategories')
@show
@stop


@section('inline-javascript')
<script lang="text/javascript">
	//https://github.com/jeffdupont/bootstrap-data-table
	$("#twitter-datatable").datatable({
		perPage: perpagejs
		, url: '/json/users/category'
		, showPagination: true
		, showTopPagination: true
		, showFilterRow: false
		, showFilter: false
		, currentPage: page
		//, filterModal: $("#table-container_1-filter")
		, post: {_token: "<?php echo csrf_token();?>" }
		, title: ''
		, columns: [
			{
				title: "Profile"
				, sortable: false
				, field: "column_profile_picture"
				, css: {
					width: '25%'
				}
			}
			, {
				title: "Description"
				, sortable: false
				, field: "column_description"
				, css: {
					width: '60%'
				}
			}
			, {
				title: "Category"
				, sortable: false
				, field: "column_category"
				, css: {
					width: '10%'
				}
			}
			, {
				title: "Kred Score"
				, sortable: false
				, field: "column_score"
				, css: {
					textAlign: 'right'
					, width: '5%'

				}
			}
		]
	});
</script>
@stop
