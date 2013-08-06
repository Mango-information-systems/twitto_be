<?php

class TopicController extends BaseController {
	public function jsonUsers() {
		$_user = new Twuser();
		$users = $_user->getUsers();

		return Response::json($users, 200);
	}

	public function jsonUserDetails($tw_id) {
		$_user = new Twuser();
		$users = $_user->getUserDetails($tw_id);

		$users[0]->description = twitter_txt_parse($users[0]->description);


		return Response::json($users[0], 200);
	}

	public function jsonTopics() {
		$_user = new Twuser();
		$topics = $_user->getTopics();

		return Response::json($topics, 200);
	}

}
