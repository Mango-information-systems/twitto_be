/*
 * JQuery functions for slideout feedback form
 *
 * Sets up a sliding form on click of a feedback button
 * On submit button will send the data to a php script
 *
 * By http://www.paulund.co.uk
 */
$("#feedback_button").click(function(){
	$('#feedback-form').slideToggle();
});



$(document).ready(function() {
		var opts = {
			lines: 13, // The number of lines to draw
			length: 20, // The length of each line
			width: 10, // The line thickness
			radius: 30, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#000', // #rgb or #rrggbb
			speed: 1, // Rounds per second
			trail: 60, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px
		};
		var target = document.getElementById('feedback-form');
		var spinner = new Spinner(opts);

		$(document).on("eldarion-ajax:begin", function(evt, $el) {
			$('#submit_form').attr("disabled", "disabled");
			spinner.spin(target);
		});

		$(document).on("eldarion-ajax:complete", function(evt, $el) {
			$('#submit_form').removeAttr("disabled");
			spinner.stop();
		});
	}


);


