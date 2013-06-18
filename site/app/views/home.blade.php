@extends('_layouts.default')
@section('main')
<div class="row-fluid" id="isotope-container">
	@foreach ($categories as $key => $category)
	<div class="category">
		<h2><a href="{{{ URL::to('category/' . $category->category_id ) }}}">{{ $category->category_name }}</a></h2>
		@foreach ($users[$category->category_id] as $key_user => $user)
		<div class="media">
			<a href="#" class="pull-left">
				<img src="{{ $user->profile_image_url }}" width="48" height="48" class="img-rounded" alt="{{ $user->screen_name }}" title="{{ $user->screen_name }}" /><br/>
			</a>
			<div class="media-body">
				<div class="pull-right">
					<span class="badge badge-warning">{{ $user->pivot->kred_score }}</span>
				</div>

				<span class="lead">{{ $user->name }}</span>
				<a href="https://www.twitter.com/{{ $user->screen_name }}" target="_blank">@{{ $user->screen_name }}</a>
				<p>
					<span class="badge badge-inverse">{{ $user->followers_count }}</span>
					<span class="badge badge-default">{{ $user->friends_count }}</span>
					<i class="icon-map-marker"></i> {{ $user->location }}
				</p>
				
				<p><?php echo substr($user->description, 0, 50); ?></p>
			</div>
		</div>
		@endforeach
		<span class="pull-right"><a href="{{{ URL::to('category/' . $category->category_id ) }}}">Read more...</a></span>
	</div>
	@endforeach
</div>
@stop

{{-- Web site Title --}}
@section('title')
{{ $page_title }}
@parent
@stop

{{-- h1 --}}
@section('h1-title')
Belgian users of twitter, categorized and ranked by their Kred influence score
@parent
@stop

{{-- New Laravel 4 Feature in use --}}
@section('inline-javascript')
@parent
$(window).load(function() {
$('#isotope-container').isotope({
// options
itemSelector : '.category',
layoutMode : 'fitRows'
});
});
@stop

@section('sidebar')
@include('sidebar')
@stop