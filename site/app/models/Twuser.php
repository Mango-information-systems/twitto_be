<?php

class Twuser extends Eloquent {
    protected $table = 'tw_user';
	protected $primaryKey = 'id';
	public $timestamps = false;

	public function getUsers(){

		$return_array = [];

		// Change the fetch mode to "FETCH_NUM"
		// So that an indexed array is returned
		// Converting it to JSON results in a smaller file
		DB::setFetchMode(PDO::FETCH_NUM);

		$query  = DB::table('tw_user')
			->join('fact_topic', 'tw_user.tw_id', '=', 'fact_topic.tw_id')
			->orderBy('klout_score', 'desc')
			->select('tw_user.tw_id as tw_id', 'lang', 'province_id',
				'klout_score', DB::raw('GROUP_CONCAT( fact_topic.topic_id ) AS topic_id'),
				'screen_name'
			)
			->where('fact_topic.topic_id', '!=', '-1')
			->remember(1440)
			->groupBy('tw_user.tw_id');

		$return_array['tw_user'] = $query->get();

		/*
		$queries = DB::getQueryLog();
		$last_query = end($queries);

		var_dump($last_query);
		var_dump($return_array);
		die;
		*/
		DB::setFetchMode(PDO::FETCH_CLASS);

		return $return_array;
	}

	public function getIds($searchString = ""){

		$return_array = [];
		$return_array_num = [];

		// Change the fetch mode to "FETCH_NUM"
		// So that an indexed array is returned
		// Converting it to JSON results in a smaller file
		DB::setFetchMode(PDO::FETCH_NUM);

		$query  = DB::table('tw_user')
			->select('tw_id')
			->whereRaw('MATCH(screen_name, name, description) AGAINST (?)', [$searchString])
			->orderBy('klout_score', 'desc')
			->remember(1440)
			->groupBy('tw_id');

		$return_array['tw_id'] = $query->get();
		// Pull the array, one level up
		// As seen in http://stackoverflow.com/questions/3863629/array-to-one-level-higher
		$return_array['tw_id'] = call_user_func_array('array_merge', $return_array['tw_id']);
		
		// We need to take care of the string to int on our own
		foreach ($return_array['tw_id'] as $key => $value) {
			$return_array_num['tw_id'][$key] = (int) $value;
		}
		//$return_array['tw_id'] = (string)$query->get();
		// $return_array['tw_id'] = implode(',', $query->get());

		/*
		$queries = DB::getQueryLog();
		$last_query = end($queries);

		var_dump($last_query);
		var_dump($return_array);
		die;
		*/
		DB::setFetchMode(PDO::FETCH_CLASS);

		return $return_array_num;
	}

	public function getUserDetails($tw_id){

		$query = DB::table('tw_user')
			->select('description', 'profile_image_url', 'name', 'screen_name', 'tw_id')
			->whereIn('tw_id', explode(",", $tw_id))
			->remember(1440);

		return $query->get();
	}

}
