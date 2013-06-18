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

		//$categories = Category::with('twusers')->orderBy('sorting_order')->get();
		// Above was causing error 500. Investigate!
		$categories = Category::orderBy('sorting_order', 'asc')->get();

		// Dirty walkaround. I dont know what to do to limit the result while
		// using eager loading.
		foreach ($categories as $category){
			$_category = Category::where('category_id', '=', $category->category_id)->first();
			$users[$category->category_id] = $_category->twusers()->take(5)->get();
		}

		return View::make('home', compact('page_title', 'categories', 'categorySlug', 'users'));
	}

}