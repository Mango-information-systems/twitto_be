<?php

class CategoryController extends BaseController {

	protected $category;

	public function __construct(Category $category) {
		parent::__construct();

		$this->category = $category;
	}

	public function getCategory($categorySlug) {

		$categories = DB::table('category')->orderBy('sorting_order')->get();

		// Get category data
		$category = $this->category->where('category_id', '=', $categorySlug)->first();

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