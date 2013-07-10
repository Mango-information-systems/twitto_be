<div class="well sidebar-nav">
    <ul class="nav nav-list">
        <li class="nav-header">Categories</li>
        @foreach ($categories as $key => $category)
        <li><a href="{{{ URL::to('category/' . $category->category_id ) }}}" 
               @if($category->category_id == $category_id)
			   class="active"
               @endif
               >
               {{ $category->category_name }}</a></li>
        @endforeach
    </ul>
</div><!--/.well -->

<div class="well sidebar-nav">
	<ul class="nav nav-list">
        <li class="nav-header">Legend</li>
		<li>
			<span class="badge badge-warning">Kred</span> influence score <br/><small>between 0 and 1000</small>
		</li>
		<li>
			<span class="badge badge-inverse">Followers</span>
			<span class="badge badge-default">Following</span>
		</li>
	</ul>
</div>
