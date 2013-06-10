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
</div><!--/.well -->