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

	public function getUsersCategory() {

		$input = Input::all();
		$total_rows = 200;

		$records_number = $input["perPage"] ?: 10;
		$page_number = $input["currentPage"] ?: 1;

		$offset = $records_number * $page_number;

		$_user = new Twuser();
		$users = $_user->getUsersCategory($records_number, $offset);

		//$users_json = json_encode($users);


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
					"column_rank"  => $user->id,
					"column_profile_picture"  => '<img src="'.$user->profile_image_url.'" width="48" height="48" class="img-rounded" alt="'.$user->screen_name.'" title="'.$user->screen_name.'" /><br/>',
					"column_name_username"  => '<span class="lead">'.$user->name.'</span><br/><a href="https://www.twitter.com/'.$user->screen_name.'" target="_blank">@'.$user->screen_name.'</a>',
					"column_description"  => $user->description,
					"column_category"  => '<a href="'.URL::to('category/' . $user->main_category_id ).'">'.$user->category_name.'</a>',
					"column_score"  => $user->kred_score
				)
			);
		}

		echo json_encode($return_array);
		die;

	}

	public function getUsersCategoryTest() {

		$total_rows = 200;
		$per_page = $_POST["perPage"] ?: 10;
		$current_page = $_POST["currentPage"] ?: 1;

		$sort = array(array( "column_0", "desc" ), array( "column_2", "asc" ));
		$filter = array("column_0" => "foo");

		$example = array(

			"totalRows"   => $total_rows,
			"perPage"     => $per_page,
			"sort"        => $sort,
			"filter"      => $filter,
			"currentPage" => $current_page,
			"data"        => array(),

			"posted"      => $_POST

		);

		for($i = 1; $i <= $per_page; $i++) {
			$current_row = ($current_page * $per_page) - $per_page + $i;
			if($current_row > $total_rows) break;

			$example["data"][] = array(
				"column_0"  => "row: " . $current_row . " column 1 " . rand(0,100),
				"column_1"  => "<img src='http://www.dtwitto.be/assets/img/mango-information-systems-square-logo-23x23.png'/>",
				"column_2"  => "row: " . $current_row . " column 3 " . rand(0,100),
				"column_3"  => "row: " . $current_row . " column 4 " . rand(0,100),
			);
		}

// header('Content-type: text/json');
		echo json_encode($example);
		die;

	}

}
