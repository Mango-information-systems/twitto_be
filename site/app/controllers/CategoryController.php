<?php

class CategoryController extends BaseController {

	public function getCategory($category_id) {
		$categories = Category::orderBy('sorting_order', 'asc')->get();
		// Get category data
		$category = Category::where('category_id', '=', $category_id)->first();

		// Check if category exists
		if (is_null($category)) {
			return App::abort(404);
		}


		$page_title = "Top Belgian influencers in $category->category_name category";
		$page_desc = "Ranking Belgian twitter users belonging to $category->category_name category according to their Kred social influence score";
		$h1_title = "Top Belgian twitter influencers in \"$category->category_name\"";

		return View::make('category', compact('page_title', 'page_desc', 'h1_title', 'category', 'categories', 'category_id'));
	}

	public function jsonUsersCategory() {

		$input = Input::all();

		$records_number = (isset($input["perPage"]) ? $input["perPage"] : 100);
		$page_number = (isset($input["currentPage"]) ? $input["currentPage"] : 1);
		$category_id = (isset($input["category_id"]) ? $input["category_id"] : 0);
		$search_username = (isset($input["search_username"]) ? $input["search_username"] : 0);

		$offset = $records_number * ($page_number-1);

		$_user = new Twuser();
		$users = $_user->getUsersCategory($records_number, $offset, $category_id, $search_username);

		$return_array = array(

			"totalRows"   => $users['row_num'],
			"perPage"     => $records_number,
			"sort"        => array(),
			"filter"      => array(),
			"currentPage" => $page_number,
			"data"        => array(),

			"posted"      => $input
		);



		foreach($users['data'] as $user){
			array_push(
				$return_array["data"],
				array(
					"column_rank"  => '<span class="lead">'.rand(1, $users['row_num']).'</span>',
					"column_profile_picture"  => '<div class="media"><a class="pull-left" href="https://www.twitter.com/'.$user->screen_name.'" target="_blank"><img src="'.$user->profile_image_url.'" width="48" height="48" class="img-rounded media-object size48" alt="'.$user->screen_name.'" title="'.$user->screen_name.'" /></a>
<div class="media-body">
<h4 class="media-heading">'.$user->name.'</h4>
<a href="https://www.twitter.com/'.$user->screen_name.'" target="_blank">@'.$user->screen_name.'</a>
</div>',
					"column_name_username"  => '<span class="lead">'.$user->name.'</span><br/><a href="https://www.twitter.com/'.$user->screen_name.'" target="_blank">@'.$user->screen_name.'</a>',
					"column_description"  => twitter_txt_parse($user->description),
					"column_category"  => '<a href="'.URL::to('category/' . $user->main_category_id ).'/'. Str::slug($user->category_name) .'">'.$user->category_name.'</a>',
					"column_score"  => '<span class="lead">'.$user->kred_score.'</span>'
				)
			);
		}

		return Response::json($return_array, 200);

	}

}
