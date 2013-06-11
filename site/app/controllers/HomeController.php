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

		// Dirty walkaround. I dont know what to do to limit the result while
		// using eager loading.
		foreach ($categories as $category){
			$users[$category->category_id] = $category->twusers()->take(5)->get();
		}

		return View::make('home', compact('page_title', 'categories', 'categorySlug', 'users'));
	}

}