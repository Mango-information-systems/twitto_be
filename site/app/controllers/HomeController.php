<?php

class HomeController extends BaseController {

	/*
	|--------------------------------------------------------------------------
	| Default Home Controller
	|--------------------------------------------------------------------------
	|
	| You may wish to use controllers instead of, or in addition to, Closure
	| based routes. That's great! Here is an example controller method to
	| get you started. To route to this controller, just add the route:
	|
	|	Route::get('/', 'HomeController@showWelcome');
	|
	*/

	public function index(){

		//Retrieve all categories that contain users
//		$categories = Category::has('twusers')->get();
//		$users[] = array();

//		foreach ($categories as $key => $category) {
//			$users[$category->category_id] =
//					Twuser::has('categories', '=', $category->category_id )->get();
//		}


//		foreach ($users as $value) {
//			var_dump($value->screen_name);
//			var_dump($value->id);
//
//		}

		$categories = Category::with('twusers')->get();

		return View::make('home', array('categories' => $categories));
	}

}