<?php

class TopicController extends BaseController {
	public function jsonUsers($searchStr = "") {
		$_user = new Twuser();
		$searchStr = trim($searchStr);;

		$users = $_user->getUsers($searchStr);

		return Response::json($users, 200);
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

	public function jsonTopics() {
		$_user = new Twuser();
		$topics = $_user->getTopics();

		return Response::json($topics, 200);
	}

}
