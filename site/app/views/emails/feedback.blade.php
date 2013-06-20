<!DOCTYPE html>
<html lang="en-US">
	<head>
		<meta charset="utf-8">
	</head>
	<body>
		<h2>Twitto.be - Feedback Form</h2>

		<div>
			This form has been sent from Twitto.be
			<p><strong>Email:</strong> {{ $email }}</p>
			<p><strong>Text:</strong> {{ nl2br($feedback_text) }}</p>
			<p><strong>Remote IP:</strong> {{ Request::server('REMOTE_ADDR'); }}</p>
			<p><strong>Remote Host:</strong> {{ Request::server('REMOTE_HOST'); }}</p>

		</div>
	</body>
</html>