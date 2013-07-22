<?php

/*
|--------------------------------------------------------------------------
| Custom Functions
|--------------------------------------------------------------------------
|
*/

//https://github.com/mzsanford/twitter-text-php
function twitter_txt_parse($txt){

	require_once app_path().'/lib/TwitterText/Autolink.php';
	require_once app_path().'/lib/TwitterText/Extractor.php';
	require_once app_path().'/lib/TwitterText/HitHighlighter.php';

	$html = Twitter_Autolink::create($txt)
		->setNoFollow(false)
		->addLinks();

	return $html;
}
