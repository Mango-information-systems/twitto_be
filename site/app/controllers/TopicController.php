<?php

class TopicController extends BaseController {
	public function jsonUsers() {
		$_user = new Twuser();

		$users = $_user->getUsers();

		return Response::json($users, 200);
	}
	
	public function jsonSearch($searchStr = "") {
		$_id = new Twuser();
		$searchStr = trim($searchStr);;

		$ids = $_id->getIds($searchStr);

		return Response::json($ids, 200);
	}

	public function jsonUserDetails($tw_id) {
		$_user = new Twuser();
		$users = $_user->getUserDetails($tw_id);
		$new_users = [];

		foreach($users as $key => $user){
			$users[$key]->description = twitter_txt_parse($user->description);
			$new_users[$user->tw_id] = $user;

		}

		return Response::json($new_users, 200);
	}

}
