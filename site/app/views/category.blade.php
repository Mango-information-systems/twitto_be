@extends('_layouts.default')

{{-- Web site Title --}}
@section('title')
{{ $page_title }}
@parent
@stop

{{-- New Laravel 4 Feature in use --}}
@section('inline-javascript')
@parent
$(window).load(function() {
$('#isotope-container').isotope({
// options
itemSelector : '.user',
layoutMode : 'fitRows'
});
});
@stop

@section('sidebar')
@include('sidebar')
@stop
 
@section('main')
<h2>{{ $category->category_name }}</h2>
<div class="row-fluid" id="isotope-container">
	@foreach ($users as $key_user => $user)
	<div class="user">
		<div class="media">
			<a href="#" class="pull-left">
				<img src="{{ $user->profile_image_url }}" @if($key_user == 0) width="73" height="73"  @endif class="img-rounded" /><br/>
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
				</p>
				<p>{{ $user->description }}</p>
			</div>
		</div>
	</div>
	@endforeach
</div>


@stop