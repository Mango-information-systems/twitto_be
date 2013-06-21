<div class="nav-collapse collapse">
	<p class="navbar-text pull-right">
		
	</p>
	
	<ul class="nav">
		<li <?php echo (Route::getCurrentRoute()->getPath() == '/about')? 'class="active"' : ''  ?>><a href="{{ URL::to('about') }}">About</a></li>
	</ul>
	
</div>