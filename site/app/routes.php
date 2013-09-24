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

# Json Get all users
Route::get('json/users', 'TopicController@jsonUsers');

# Json keyword search
Route::get('json/search/{searchStr}', 'TopicController@jsonSearch');

# Json Get users details
Route::get('json/userDetails/{username}', 'TopicController@jsonUserDetails');

# Index Page - Last route, no matches
Route::get('/', array('as' => 'home', 'uses' => 'HomeController@index'));
