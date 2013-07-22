<?php

class StaticController extends BaseController {

	public function privacy(){
        $page_title = 'Privacy Policy';
        $page_desc = 'twitto.be privacy policy';
		$category_id = 0;

		$categories = Category::orderBy('sorting_order', 'asc')->get();

		return View::make('privacy', compact('page_title', 'page_desc', 'categories', 'category_id'));
	}

	public function about(){
        $page_title = 'About';
        $page_desc = 'what is twitto.be all about';
		$category_id = 0;

        $categories = Category::orderBy('sorting_order', 'asc')->get();

		
		return View::make('about', compact('page_title', 'page_desc', 'categories', 'category_id'));
	}


}
