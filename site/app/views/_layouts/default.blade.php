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
					@section('topmenu')
					@include('topmenu')
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
					<h1>Belgian users of twitter, categorized and ranked by their Kred influence score</h1>
					@yield('main')
				</div><!--/span-->
			</div><!--/row-->

			<hr>

			<footer>
				<p>&copy; <a href="http://mango-is.com/" target="_blank"><img src="{{ URL::asset('assets/img/mango-information-systems-square-logo-23x23.png') }}" /> Mango Information systems 2013</a></p>
			</footer>

		</div><!--/.fluid-container-->

		<!-- Le javascript
		================================================== -->
		<!-- Placed at the end of the document so the pages load faster -->
		<script src="{{ URL::asset('assets/js/jquery-2.0.2.min.js') }}"></script>
		<script src="{{ URL::asset('assets/js/jquery.isotope.min.js') }}"></script>
		@if(!Config::get('app.debug'))
		<script>
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

			ga('create', 'UA-25766439-4', 'twitto.be');
			ga('send', 'pageview');
		</script>
		@endif


        <script lang="text/javascript">
			@section('inline-javascript')
			@show
		</script>

	</body>
</html>
