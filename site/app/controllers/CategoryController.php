<?php

class CategoryController extends BaseController {

	public function getCategory($categorySlug) {

		$categories = Category::orderBy('sorting_order', 'asc')->get();
		// Get category data
		$category = Category::where('category_id', '=', $categorySlug)->first();

		// Check if category exists
		if (is_null($category)) {
			return App::abort(404);
		}

		// Get category users
		$users = $category->twusers()->take(100)->get();

		$page_title = "Top Belgian influencers in $category->category_name category";
		$page_desc = "Ranking Belgian twitter users belonging to $category->category_name category according to their Kred social influence score";

		return View::make('category', compact('page_title', 'page_desc', 'category', 'users', 'categories', 'categorySlug'));
	}

	public function getUsersCategory($pageNumber) {

		$recordsNumber = 5;
		$offset = $recordsNumber * $pageNumber;

		$_user = new Twuser();
		$users = $_user->getUsersCategory($recordsNumber, $offset);

		$users_json = json_encode($users);

		echo $users_json;
		die;

	}

}
