@extends('_layouts.default') 
@section('main')
<h1></h1>
<div class="row-fluid" id="isotope-container">
	@foreach ($users as $key_user => $user)
	<div class="user">
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
				<p>{{ $user->description }}</p>
			</div>
		</div>
	</div>
	@endforeach
</div>
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
Top Belgian twitter influencers in "{{ $category->category_name }}"
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