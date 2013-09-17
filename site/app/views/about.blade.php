@extends('_layouts.default')
@section('main')
<div class="row-fluid">
	
<div class="span8">
	<h2 id="intro">Intro <small> What is twitto.be all about</small></h2>
	<p>
		Twitto.be is a directory referencing Belgian twittos (users of twitter). It was launched in June 2013. It lets you explore the belgian twittosphere based on their location (province in Belgium), topics and language. <a href = "http://klout.com" target = "_blank">Klout</a> influence scores are used to rank the people.
	</p>
	<p>
		Twitto.be was created and designed by <a href="http://mango-is.com" target="_blank">Mango Information Systems SPRL</a>, a Belgian company active in social media analysis and monitoring. Panagiotis Synetos from <a href="http://11dig.it" target="_blank">11 Digit Labs</a> took care of most of the web development.
	</p>
	<h2 id="who-is-in">Who is in<small> what is a "Belgian" on twitter</small></h2>

	<p>Anyone matching with at least one of the following criteria could appear in the directory:</p>

	<ul>
		<li><strong>from Belgium</strong>: anyone with location field on twitter set to somewhere in Belgium,</li>
		<li><strong>connected to Belgium</strong>: tweeting about Belgium or interacting with Belgians on a regular basis,</li>
		<li><strong>Belgian expat</strong>.</li>
	</ul>

	<div class="well">
		<h3>How to get listed</h3>
		<p>
			If you are not yet referenced and would like to appear on twitto.be, please send us a tweet <a target="_blank" href="https://twitter.com/intent/tweet?url=http%3A%2F%2Ftwitto.be&amp;text=%40twitto_be%20please%20add%20me%20to&amp;hashtags=twittoBe">@twitto_be</a>, or use the feedback form at the bottom of this page.
		</p>
	</div>

	<h2 id="history">History<small> where the idea came from</small></h2>

	<p>While working on <strong><a href="http://tribalytics.com" target="_blank">tribalytics</a>, a tool helping marketers plan their marketing campaigns on twitter</strong>, we extracted about 200 000 twitter users from in Belgium. At about that time, <a href="https://twitter.com/vinch01" target="_blank">@vinch01</a> announced <a href="http://www.vinch.be/blog/2013/05/12/recherche-repreneurs-pour-le-projet-klout-be/" target="_blank">he was planning on retiring klout.be service</a> he had launched. Knowing about who is using twitter in Belgium is a recurring question, and we felt like having an exhaustive public directory, available for free, would be something useful.
	</p>

	<p>
		We also wanted to demonstrate the possibilities in multi-dimensional exploration (aka. faceted browsing) of data and designed the tool to be filterable using multiple structured criteria at a time. This way, results for niches can easily be accessed.
	</p>

	<p>
		From the 600000+ twitter accounts of our database, we analyzed location field, and could reliably identify 90000+ of them as matching with a location in Belgium. This was the initial dataset visible in twitto, which we expanded progressively.
	</p>

	<div class="well">
		<h3>How to contribute</h3>
		<p>
		twitto.be is an open source initiative. You can use our code to create your own directory of twitter users, maybe focused on different geographies or topics that are of interest to you. Also, <strong>contributions are welcome</strong>, please contact us if you have any suggestion and would like to participate. The source code is available on <a href="https://github.com/Mango-information-systems/twitto_be">github</a>.
		</p>
	</div>

	<h2 id="privacy">Privacy<small> matters</small></h2>
	<p>
		We value and understand privacy, and intend to respect the rights of persons on their own data.
	</p>
	<p>
		All the information that we display is publicly available on twitter. Only <strong>public twitter accounts</strong> are displayed. Protected accounts are not included.
	</p>

	<p>
		Any data removed from twitter will also be removed from twitto.be.
	</p>
	<p>
		Individuals willing not to appear in <a href="/">twitto.be</a> should email us at <a href="mailto:contact [ at ] twitto.be">contact [ at ] twitto.be</a>.
	</p>
</div>
<div class="span4">
	<div class="well">
	<h2>Audience segmentation for professionals</h2>
	<p>Do you really know who is following you? Tribalytics <strong>segments your twitter followers</strong> into like minded communities, identifies the most connected individuals and <strong>helps you monitor how the competition are doing</strong>.</p>
	<p><a target="_blank" href="http://tribalytics.com" class="btn btn-primary btn-large">visit tribalytics.com »</a></p>
	</div>
</div>
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
About
@stop



@section('sidebar')
@include('sidebar')
@stop
