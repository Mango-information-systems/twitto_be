@extends('_layouts.default')
@section('main')
<div class="row-fluid">
<h2 id="intro">Intro <small> What is twitto.be all about</small></h2>
<p>
    Twitto.be is a directory referencing Belgian users of twitter. It was launched in June 2013, and features are progressively rolled out.</p>
<p>
    It was created by <a href="http://mango-is.com" target="_blank">Mango Information Systems SPRL</a>, a Belgian company active in social media analysis and monitoring.
</p>
<h2 id="roadmap">Roadmap<small> Where we are heading to</small></h2>

<p>These are the features we are working on at the moment:</p>

<ul>
    <li><strong>ranking</strong> by Kred <strong>influence</strong> score (updated daily)</li>
    <li><strong>categorization</strong> by topics and type of account (person / company)</li>
    <li><strong>filters</strong> and person search</li>
    <li><strong>crowdsourcing</strong>: addition of twittos, removal, management of categories by the visitors</li>
    <li><strong>statistics</strong> about the twitter users</li>
</ul>


<h2 id="history">History<small> Where the idea came from</small></h2>
<p>
    Twitto.be was a reaction to <a href="https://twitter.com/vinch01" target="_blank">@vinch01</a> announcing <a href="http://www.vinch.be/blog/2013/05/12/recherche-repreneurs-pour-le-projet-klout-be/" target="_blank">he is planning on retiring klout.be service</a> he had launched. While working on <a href="http://tribalytics.com" target="_blank">tribalytics</a>, a tool analyzing twitter followers population, we extracted an important number of twitter accounts, many of which were from Belgian users. Knowing about who is using twitter in Belgium is a recurring question, and we felt like having an exhaustive public directory, available for free, would be something valuable.
</p>
<p>
    From the 600000+ twitter accounts of our database, we analyzed location field, and could reliably identify 90000+ of them as matching with a location in Belgium. This was the initial dataset visible in twitto.
</p>


<h2 id="privacy">Privacy<small> matters</small></h2>
<p>We value and understand privacy, and intend to respect the rights of persons on their own data. All the information that we display is publicly available on twitter. Any data removed from twitter will also be removed from twitto.be. Individuals willing not to appear in <a href="/">twitto.be</a> should email us at <a href="mailto:contact [ at ] twitto.be">contact [ at ] twitto.be</a>.</p>
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