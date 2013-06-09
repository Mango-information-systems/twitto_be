@extends('_layouts.default')
 
@section('main')
<div class="row-fluid">
@foreach ($categories as $key => $category)
<div class="category">
	<h2>{{ $category->category_name }}</h2>
	@foreach ($category->twusers as $key_user => $user)
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
			<p><?php echo substr($user->description, 0, 50); ?></p>
		</div>
	</div>
	@endforeach
</div>
@endforeach
</div>


@stop