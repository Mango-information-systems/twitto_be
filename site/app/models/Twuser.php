<?php

class Twuser extends Eloquent {
    protected $table = 'tw_user';
	protected $primaryKey = 'id';
	
	public $timestamps = false;

	public function categories(){
		return $this->belongsToMany('Category', 'fact_influence', 'tw_id', 'main_category_id')->withPivot('kred_score')->orderBy('kred_score');
	}

	public function getUsersCategory($howmany, $skip = 0, $category_id = 0){

		$return_array = [];

		$query_all = DB::table('tw_user')
			->join('fact_influence', 'tw_id', '=', 'id')
			->join('category', 'main_category_id', '=', 'category_id')
			->select('tw_id as id')
			->remember(10);

		$query = DB::table('fact_influence')
			->leftJoin('tw_user', 'tw_id', '=', 'id')
			->leftJoin('category', 'main_category_id', '=', 'category_id')
			->skip($skip)
			->take($howmany)
			->orderBy('kred_score', 'desc')
			->select('tw_id as id','screen_name', 'description',
				'category_name','main_category_id', 'profile_image_url',
				'kred_score', 'name')
			->remember(10);

		if($category_id != 0){
			$query_all = $query_all->where('category_id', '=', $category_id);
			$query = $query->where('category_id', '=', $category_id);
		}

		$return_array['row_num'] = $query_all->count();
		$return_array['data'] = $query->get();
		return $return_array;
	}
}
