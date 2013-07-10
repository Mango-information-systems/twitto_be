<?php

class HomeController extends BaseController {

	/*
	|--------------------------------------------------------------------------
	| Default Home Controller
	|--------------------------------------------------------------------------
	*/
	public function index(){
		$page_title = '90000+ Belgian tweeters ranked by influence';
		$page_desc = 'twitto.be lets you explore the Belgian twitter users community.';
		$h1_title = 'Belgian users of twitter, categorized and ranked by their Kred influence score';

		$category_id = 0;

		$categories = Category::orderBy('sorting_order', 'asc')->get();

		return View::make('home', compact('page_title', 'page_desc','h1_title', 'categories', 'category_id'));
	}

	public function feedback() {

		$input = Input::all();
		$input['feedback_text'] = trim($input['feedback_text']);
		$input['welcome_check'] = trim($input['welcome_check']);

		$rules = [
			'email' => 'email',
			'feedback_text' => 'required',
			'welcome_check' => 'min:0|max:0'
		];

		$validation = Validator::make($input, $rules);

		$response = [
			"error_validation" => ['html' => '<div class="feedback-status">Please fill in the required fields</div>'],
			"error_server" => ['html' => '<div class="feedback-status">Server error. Please try again later.</div>'],
			"error_too_soon" => ['html' => '<div class="feedback-status">You have already sent your feedback.<br/> Please try again in 20 seconds.</div>'],
			"success" => ['html' => '<div class="feedback-status">Thank you for your message</div>'],
		];

		if ($validation->fails()) {
			return Response::json($response["error_validation"], 200);
		} else {
			if (Session::has('feedbackpost') && ( (time() - Session::get('feedbackpost') ) <= 20)) {
				// less then 20 seconds since last post
				return Response::json($response["error_too_soon"], 200);
			} else {
				//Set time that the email was sent
				Session::put('feedbackpost', time());

				try {
					Mail::send('emails.feedback', $input, function($m) {
								$m->to('contact@twitto.be', 'twitto.be team')->subject('Twitto.be feedback - ' . date("d-m-Y H:i:s"));
							});
					return Response::json($response["success"], 200);

				} catch (Exception $e) {
					return Response::json($response["error_server"], 200);
				}
			}
		}
	}

}
