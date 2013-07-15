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
