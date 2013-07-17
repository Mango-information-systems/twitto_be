<?php

/*
|--------------------------------------------------------------------------
| Custom Functions
|--------------------------------------------------------------------------
|
*/
function twitter_txt_parse($txt){
	$txt = preg_replace('/((http)+(s)?:\/\/[^<>\s]+)/iu', '<a href="$0" target="_blank">$0</a>', $txt );
	$txt = preg_replace('/[@]+(\w+)/u', '<a href="https://twitter.com/$1" target="_blank">$0</a>', $txt );
	$txt = preg_replace('/[#]+(\w+)/u', '<a href="https://twitter.com/search?q=%23$1" target="_blank">$0</a>', $txt );

	return $txt;
}
