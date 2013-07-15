<div class="well">
	@foreach ($categories as $key => $category)
		<a href="{{{ URL::to('category/' . $category->category_id ).'/'.Str::slug($category->category_name) }}}" class="btn btn-large <?php echo(($category->category_id == $category_id) ? " btn-inverse" :""); ?> ">{{ $category->category_name }} </i></a>
	@endforeach

	<div class="form-search pull-right">
		<input type="text" class="input-medium search-query" id="search_username" placeholder="username">
		<button class="btn" id="search_username_button">Search</button>
	</div>

	<div class="clearfix"></div>
</div><!--/.well -->
