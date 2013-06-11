<div class="well sidebar-nav">
    <ul class="nav nav-list">
        <li class="nav-header">Categories</li>
        @foreach ($categories as $key => $category)
        <li><a href="{{{ URL::to('category/' . $category->category_id ) }}}" 
               @if($category->category_id == $categorySlug)
			   class="active"
               @endif
               >
               {{ $category->category_name }}</a></li>
        @endforeach
    </ul>

	<ul class="nav nav-list">
		<li class="nav-header">
			Powered by
		</li>
		<li><a href="http://mango-is.com/"><img src="{{ URL::asset('assets/img/mango-information-systems-square-logo-23x23.png') }}" /></a> <a href="http://kred.com/"><img src="{{ URL::asset('assets/img/kr-natural.png') }}" /></a></li>
	</ul>

	
</div><!--/.well -->