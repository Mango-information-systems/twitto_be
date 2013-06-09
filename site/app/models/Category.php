<?php

class Category extends Eloquent {
    protected $table = 'category';
	protected $primaryKey = 'category_id';

	public $timestamps = false;

	public function twusers(){
		return $this->belongsToMany('Twuser', 'fact_influence', 'main_category_id', 'tw_id')->withPivot('kred_score')->orderBy('kred_score', 'desc');
	}
}