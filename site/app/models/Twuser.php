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
				'screen_name'
			)
			->remember(1440)
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
			->select('description', 'profile_image_url', 'name', 'screen_name', 'tw_id')
			->whereIn('tw_id', explode(",", $tw_id))
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
