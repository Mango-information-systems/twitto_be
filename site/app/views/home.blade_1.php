@extends('_layouts.default')
 
@section('main')

<div class="row">
@foreach ($categories as $key => $category)
	@if($key%3 == 0 && $key > 0)
	</div>
	<div class="row">
	@endif
	<div class="span3">
<h2>{{ $category->category_name }}</h2>
@foreach ($category->twusers as $key_user => $user)
<div class="media">
	<a href="#" class="pull-left">
		<img src="{{ $user->profile_image_url }}" @if($key_user == 0) width="73" height="73"  @endif class="img-rounded" />
	</a>
	<div class="media-body">
		<h4 class="media-heading">@{{ $user->screen_name }}</h4>
		<?php echo substr($user->description, 0, 50); ?>
	</div>
</div>
@endforeach
	</div>
@endforeach
</div>


@stop