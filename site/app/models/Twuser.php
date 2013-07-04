<?php

class Twuser extends Eloquent {
    protected $table = 'tw_user';
	protected $primaryKey = 'id';
	
	public $timestamps = false;

	public function categories(){
		return $this->belongsToMany('Category', 'fact_influence', 'tw_id', 'main_category_id')->withPivot('kred_score')->orderBy('kred_score');
	}

	public function getUsersCategory($howmany, $skip = 0){
		return DB::table('tw_user')
			->join('fact_influence', 'tw_id', '=', 'id')
			->join('category', 'main_category_id', '=', 'category_id')
			->orderBy('kred_score', 'desc')
			->skip($skip)
			->take($howmany)
			->select('tw_id as id','screen_name', 'description',
				'category_name', 'profile_image_url',
				'kred_score', 'name')
			->get();

	}
}
