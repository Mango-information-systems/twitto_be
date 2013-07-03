<div class="nav-collapse collapse">
	<p class="navbar-text pull-right">
		
	</p>

	<ul class="nav">
		<li <?php echo (Route::getCurrentRoute()->getPath() == '/new')? 'class="active"' : ''  ?>><a href="{{ URL::to('new') }}">New</a></li>
		<li <?php echo (Route::getCurrentRoute()->getPath() == '/about')? 'class="active"' : ''  ?>><a href="{{ URL::to('about') }}">About</a></li>
	</ul>
	
</div>