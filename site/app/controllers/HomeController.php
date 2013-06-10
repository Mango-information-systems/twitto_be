<?php

class HomeController extends BaseController {

	/*
	|--------------------------------------------------------------------------
	| Default Home Controller
	|--------------------------------------------------------------------------
	*/
	public function index(){


        $page_title = 'Home';
        $categorySlug = -1;

		$categories = Category::with('twusers')->orderBy('sorting_order')->get();

		return View::make('home', compact('page_title', 'categories', 'categorySlug'));
	}

}