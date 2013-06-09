<?php

class Twuser extends Eloquent {
    protected $table = 'tw_user';
	protected $primaryKey = 'id';
	
	public $timestamps = false;

	public function categories() {
		return $this->belongsToMany('Category', 'fact_influence', 'tw_id', 'main_category_id');
	}
}