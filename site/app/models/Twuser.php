<?php

class Twuser extends Eloquent {
    protected $table = 'tw_user';
	protected $primaryKey = 'id';
	
	public $timestamps = false;

	public function categories(){
		return $this->belongsToMany('Category', 'fact_influence', 'tw_id', 'main_category_id')->withPivot('kred_score')->orderBy('kred_score');
	}

	public function getUsersCategory($howmany, $skip = 0, $category_id = 0, $search_username = ''){

		$return_array = [];

		if($howmany > 100){
			$howmany = 100;
		}

		$query_all = DB::table('tw_user')
			->join('fact_influence', 'tw_id', '=', 'id')
			->join('category', 'main_category_id', '=', 'category_id')
			->select('tw_id as id')
			->remember(1440);

		$query = DB::table('fact_influence')
			->leftJoin('tw_user', 'tw_id', '=', 'id')
			->leftJoin('category', 'main_category_id', '=', 'category_id')
			->skip($skip)
			->take($howmany)
			->orderBy('kred_score', 'desc')
			->select('tw_id as id','screen_name', 'description',
				'category_name','main_category_id', 'profile_image_url',
				'kred_score', 'name')
			->remember(1440);

		if($category_id != 0){
			$query_all = $query_all->where('category_id', '=', $category_id);
			$query = $query->where('category_id', '=', $category_id);
		}
		if($search_username != ''){
			$query_all = $query_all->where('screen_name', 'LIKE', '%'. $search_username. '%');
			$query = $query->where('screen_name', 'LIKE', '%'. $search_username. '%');

			$query_all = $query_all->orWhere('screen_name', '=', '@'. $search_username);
			$query = $query->orWhere('screen_name', '=', '@'. $search_username);

			$query_all = $query_all->orWhere('description', 'LIKE', '%'. $search_username. '%');
			$query = $query->orWhere('description', 'LIKE', '%'. $search_username. '%');
		}

		$return_array['row_num'] = $query_all->count();
		$return_array['data'] = $query->get();

		return $return_array;
	}

	public function getUsersOld(){

		$return_array = [];

		// Change the fetch mode to "FETCH_NUM"
		// So that an indexed array is returned
		// Converting it to JSON results in a smaller file
		DB::setFetchMode(PDO::FETCH_NUM);

		$query = DB::table('fact_influence')
			->leftJoin('tw_user', 'tw_id', '=', 'id')
			->leftJoin('category', 'main_category_id', '=', 'category_id')
			->orderBy('kred_score', 'desc')
			->select('screen_name', 'lang', 'main_category_id', 'main_category_id', 'main_category_id', 'main_category_id')
			->take(5000)
			->remember(1440);

		$return_array['tw_user'] = $query->get();

		DB::setFetchMode(PDO::FETCH_CLASS);

		return $return_array;
	}

	public function getUsers(){

		$return_array = [];

		// Change the fetch mode to "FETCH_NUM"
		// So that an indexed array is returned
		// Converting it to JSON results in a smaller file
		DB::setFetchMode(PDO::FETCH_NUM);
/*
		SELECT u.tw_id, lang, province_id, klout_score, ft.topic_id
FROM tw_user u, fact_topic ft
WHERE u.tw_id = ft.tw_id
ORDER BY klout_score DESC
*/
		$query  = DB::table('tw_user')
			->join('fact_topic', 'tw_user.tw_id', '=', 'fact_topic.tw_id')
			->orderBy('klout_score', 'desc')
			->select('tw_user.tw_id as tw_id', 'lang', 'province_id',
				'klout_score', DB::raw('GROUP_CONCAT( fact_topic.topic_id ) AS topic_id'),
				'screen_name', DB::raw('1'), DB::raw('1'), DB::raw('1')
			)
			->groupBy('tw_user.tw_id');


		$return_array['tw_user'] = $query->get();

		/*
		$queries = DB::getQueryLog();
		$last_query = end($queries);

		var_dump($last_query);
		die;
		*/
		DB::setFetchMode(PDO::FETCH_CLASS);

		return $return_array;
	}


	public function getUserDetails($tw_id){

		$query = DB::table('tw_user')
			->select('description', 'profile_image_url', 'name', 'screen_name')
			->where('tw_id', '=', $tw_id)
			->remember(1440);

		return $query->get();
	}

	public function getTopics(){

		//$return_array = [];

		// Change the fetch mode to "FETCH_NUM"
		// So that an indexed array is returned
		// Converting it to JSON results in a smaller file
		DB::setFetchMode(PDO::FETCH_NUM);
		/*
				SELECT u.tw_id, lang, province_id, klout_score, ft.topic_id
		FROM tw_user u, fact_topic ft
		WHERE u.tw_id = ft.tw_id
		ORDER BY klout_score DESC
		*/
		$query  = DB::table('dim_topic')
			->where('topic_type', '=', 'sub')
			->orderBy('topic_id')
			->select('topic_id', 'display_name');

		$return_array = $query->get();

		DB::setFetchMode(PDO::FETCH_CLASS);

		return $return_array;
	}

}
