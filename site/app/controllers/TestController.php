<?php

class TestController extends BaseController {

	public function testd3(){
        $page_title = 'About';
        $page_desc = 'what is twitto.be all about';
		$category_id = 0;

        //$categories = Category::orderBy('sorting_order', 'asc')->get();

		
		return View::make('testd3', compact('page_title', 'page_desc', 'category_id'));
	}


}
