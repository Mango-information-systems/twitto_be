<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>@yield('title') - Twitto.be</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="@yield('description')">
	<meta name="author" content="Mango Information Systems SPRL">
	<meta name="language" content="en">
	<meta name="revised" content="{{ Config::get('app.reviseddate') }}" scheme="YYYY-MM-DD">

	<!-- Le styles -->
	<link href="{{ URL::asset('assets/css/amelia-bootstrap.min.css') }}" rel="stylesheet">
	<link href="{{ URL::asset('assets/css/custom.css') }}" rel="stylesheet">
	<link href="{{ URL::asset('assets/css/feedback.css') }}" rel="stylesheet">
	<link href="{{ URL::asset('assets/css/dc.css') }}" rel="stylesheet">
	<!-- DataTables CSS -->
	<link rel="stylesheet" type="text/css" href="http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css">


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
		<div class="span12">
			<h1>
				@section('h1-title')
				@show
			</h1>
			@section('topcategories')
			@show
			@yield('main')
		</div><!--/span-->
	</div><!--/row-->

	<hr>

	<footer>
		<div class="container">

			<div class="row text-center">
				<div class="span12" style="float: none; margin: 0 auto;">
					&copy; <a href="http://mango-is.com/" target="_blank"><img src="{{ URL::asset('assets/img/mango-information-systems-square-logo-23x23.png') }}" /> Mango Information systems 2013</a>
					|
					<a href="https://github.com/Mango-information-systems/twitto_be" target="_blank">Fork me on Github</a>
					|
					<a href="https://twitter.com/twitto_be" target="_blank">Follow @twitto_be</a>
				</div>
			</div>
		</div>
	</footer>

</div><!--/.fluid-container-->


<div class="feedback">
	<a id="feedback_button">Feedback</a>

	<div class="well form" id="feedback-form" style="margin-bottom: 0 !important;">
		<h4>Please Send Us Your Feedback</h4>
		<?php
		echo Form::open(array('url' => 'feedback', 'method' => 'post', 'class' => 'ajax', 'data-replace' => '.feedback-status', 'data-spinner' => '.feedback-status' ));
		echo Form::email('email', null, array('placeholder' => 'Email (optional)', 'id' => 'email'));
		echo Form::textarea('feedback_text', null, array('placeholder' => 'Message (mandatory)', 'id' => 'feedback_text'));
		echo Form::text('welcome_check', null, array('id' => 'welcome_check'));
		echo Form::button('Send', array('name' => 'submit_form', 'id' => 'submit_form', 'class' => 'btn pull-right', 'type' => 'submit'));
		?>
		<?php echo Form::close();?>
		<div class="feedback-status" id="feedback-status"></div>

	</div>
</div>


<!-- Le javascript
================================================== -->
<!-- Placed at the end of the document so the pages load faster -->
<script src="{{ URL::asset('assets/js/jquery-1.10.2.min.js') }}"></script>
<script src="{{ URL::asset('assets/js/jquery.isotope.min.js') }}"></script>
<script src="{{ URL::asset('assets/js/feedback.js') }}"></script>
<script src="{{ URL::asset('assets/js/bootstrap.min.js') }}"></script>
<script src="{{ URL::asset('assets/js/bootstrap-datatable.min.js') }}"></script>
<script src="{{ URL::asset('assets/js/eldarion-ajax.min.js') }}"></script>
<script src="{{ URL::asset('assets/js/spin.min.js') }}"></script>
<script src="{{ URL::asset('assets/js/jquery.placeholder.min.js') }}"></script>
<script src="{{ URL::asset('assets/js/d3.js') }}"></script>
<script src="{{ URL::asset('assets/js/crossfilter.v1.js') }}"></script>
<script src="{{ URL::asset('assets/js/dc.js') }}"></script>
<script src="{{ URL::asset('assets/js/underscore-min.js') }}"></script>



<!-- DataTables -->
<script type="text/javascript" charset="utf8" src="http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js"></script>



@if(!Config::get('app.debug'))
<script lang="text/javascript">
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-25766439-4', 'twitto.be');
	ga('send', 'pageview');
</script>
@endif


<script lang="text/javascript">

	var page = 1;
	var perpagejs = 100;
	var lochash    = window.location.hash.substr(1),
		page = lochash.substr(lochash.indexOf('page='))
			.split('&')[0]
			.split('=')[1],
		perpagejs = lochash.substr(lochash.indexOf('perpage='))
			.split('&')[0]
			.split('=')[1]
		;

	if(!page){
		page=1;
	}

	if(!perpagejs	){
		perpagejs = 100;
	}
	</script>

@section('inline-javascript')
@show

<script lang="text/javascript">

	function search_username(){
		var dt = $("#twitter-datatable").data("datatable");
		var postdata = dt.options.post;

		//Set page to 1 when searching
		dt.options.currentPage = 1;

		postdata.search_username = $('#search_username').val();
		dt.render();
	}

	$('#search_username_button').click( function() {
		search_username();
	});

	$('#search_username').keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			search_username();
		}
	});

	$(function() {
		$('input, textarea').placeholder();
	});


</script>

</body>
</html>
