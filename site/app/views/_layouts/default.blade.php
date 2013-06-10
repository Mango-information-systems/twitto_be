<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>
            @section('title')
			- Twitto.be
			@show
        </title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<meta name="author" content="">

		<!-- Le styles -->
		<link href="{{ URL::asset('assets/css/amelia-bootstrap.min.css') }}" rel="stylesheet">
		<link href="{{ URL::asset('assets/css/custom.css') }}" rel="stylesheet">
		<style type="text/css">
			body {
				padding-top: 60px;
				padding-bottom: 40px;
			}
			.sidebar-nav {
				padding: 9px 0;
			}

			@media (max-width: 980px) {
				/* Enable use of floated navbar text */
				.navbar-text.pull-right {
					float: none;
					padding-left: 5px;
					padding-right: 5px;
				}
			}
		</style>
		<link href="{{ URL::asset('assets/css/bootstrap-responsive.css') }}" rel="stylesheet">

		<!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
		<!--[if lt IE 9]>
		  <script src="../assets/js/html5shiv.js"></script>
		<![endif]-->

		<!-- Fav and touch icons -->
		<link rel="apple-touch-icon-precomposed" sizes="144x144" href="../assets/ico/apple-touch-icon-144-precomposed.png">
		<link rel="apple-touch-icon-precomposed" sizes="114x114" href="../assets/ico/apple-touch-icon-114-precomposed.png">
		<link rel="apple-touch-icon-precomposed" sizes="72x72" href="../assets/ico/apple-touch-icon-72-precomposed.png">
		<link rel="apple-touch-icon-precomposed" href="../assets/ico/apple-touch-icon-57-precomposed.png">
		<link rel="shortcut icon" href="../assets/ico/favicon.png">
	</head>

	<body>

		<div class="navbar navbar-inverse navbar-fixed-top">
			<div class="navbar-inner">
				<div class="container">
					<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>
					<a class="brand" href="{{{ URL::to('/') }}}">Twitto.be</a>
					<!--					<div class="nav-collapse collapse">
											<p class="navbar-text pull-right">
												Logged in as <a href="#" class="navbar-link">Username</a>
											</p>
											<ul class="nav">
												<li class="active"><a href="#">Home</a></li>
												<li><a href="#about">About</a></li>
												<li><a href="#contact">Contact</a></li>
											</ul>
										</div>/.nav-collapse -->
				</div>
			</div>
		</div>

		<div class="container-fluid">
			<div class="row-fluid">
				<div class="span3">
                    @section('sidebar')
                    @show
				</div><!--/span-->
				<div class="span9">
					@yield('main')
				</div><!--/span-->
			</div><!--/row-->

			<hr>

			<footer>
				<p>&copy; Company 2013</p>
			</footer>

		</div><!--/.fluid-container-->

		<!-- Le javascript
		================================================== -->
		<!-- Placed at the end of the document so the pages load faster -->
		<script src="{{ URL::asset('assets/js/jquery-2.0.2.min.js') }}"></script>
		<script src="{{ URL::asset('assets/js/jquery.isotope.min.js') }}"></script>



        <script lang="text/javascript">
			@section('inline-javascript')
			@show
		</script>

	</body>
</html>
