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

Route::post('feedback', 'HomeController@feedback');

Route::get('privacy', 'StaticController@privacy');
Route::get('about', 'StaticController@about');

#Test D3
Route::get('testd3', 'TestController@testd3');

# Json Get all users
Route::get('json/users.json', 'CategoryController@jsonUsers');

# Json Get all users
Route::get('json/userDetails/{username}', 'CategoryController@jsonUserDetails');

# Json Get users of category / pagination
Route::post('json/users/category', 'CategoryController@jsonUsersCategory');

# Categories - Second to last set, match slug
Route::get('category/{categoryId}/{categorySlug?}', 'CategoryController@getCategory');

# Index Page - Last route, no matches
Route::get('/', array('as' => 'home', 'uses' => 'HomeController@index'));
