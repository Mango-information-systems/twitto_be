<div class="well sidebar-nav">
	@foreach ($categories as $key => $category)
		<a href="{{{ URL::to('category/' . $category->category_id ) }}}" class="btn btn-large">{{ $category->category_name }} <i class="icon-th-large"></i></a>
	@endforeach

	<form class="form-search pull-right">
		<input type="text" class="input-medium search-query">
		<button type="submit" class="btn">Search</button>
	</form>

	<div class="clearfix"></div>
</div><!--/.well -->