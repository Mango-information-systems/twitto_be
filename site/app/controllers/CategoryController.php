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

		$page_title = $category->category_name;

		return View::make('category', compact('page_title', 'category', 'users', 'categories', 'categorySlug'));
	}

}