<?php

class HomeController extends BaseController {

	/*
	|--------------------------------------------------------------------------
	| Default Home Controller
	|--------------------------------------------------------------------------
	*/
	public function index(){
		$page_title = 'top twitter influencers in Belgium by topic, location and language';
		$page_desc = 'twitto.be lets you explore the Belgian twittos, ranked by their Klout score, with powerful filters and visualizations';
		$h1_title = 'top twitter influencers in Belgium by topic, location and language';

		$category_id = 0;

		$input = Input::all();
		$filters['topics'] = (isset($input['topics']) ? trim($input['topics']) : '');
		$filters['locations'] = (isset($input['locations']) ? trim($input['locations']) : '');
		$filters['languages'] = (isset($input['languages']) ? trim($input['languages']) : '');
		$filters['searchString'] = (isset($input['search']) ? trim($input['search']) : '');

		return View::make('home', compact('page_title', 'page_desc','h1_title', 'category_id', 'filters'));
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
			"error_validation" => ['html' => '<div class="feedback-status" id="feedback-status">Please fill in the required fields</div>'],
			"error_server" => ['html' => '<div class="feedback-status" id="feedback-status">Server error. Please try again later.</div>'],
			"error_too_soon" => ['html' => '<div class="feedback-status" id="feedback-status">You have already sent your feedback.<br/> Please try again in 20 seconds.</div>'],
			"success" => ['html' => '<div class="feedback-status" id="feedback-status">Thank you for your message</div>'],
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
