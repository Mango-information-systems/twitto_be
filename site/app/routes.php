<?php

/*
  |--------------------------------------------------------------------------
  | Application Routes
  |--------------------------------------------------------------------------
  |
  | Here is where you can register all of the routes for an application.
  | It's a breeze. Simply tell Laravel the URIs it should respond to
  | and give it the Closure to execute when that URI is requested.
  |
 */

/** ------------------------------------------
 *  Route model binding
 *  ------------------------------------------
 */
Route::model('category', 'Category');

# Categories - Second to last set, match slug
Route::get('category/{categorySlug}', 'CategoryController@getCategory');

# Index Page - Last route, no matches
Route::get('/', array('as' => 'home', 'uses' => 'HomeController@index'));

//Route::get('admin/logout',  array('as' => 'admin.logout',      'uses' => 'App\Controllers\Admin\AuthController@getLogout'));
//Route::get('admin/login',   array('as' => 'admin.login',       'uses' => 'App\Controllers\Admin\AuthController@getLogin'));
//Route::post('admin/login',  array('as' => 'admin.login.post',  'uses' => 'App\Controllers\Admin\AuthController@postLogin'));