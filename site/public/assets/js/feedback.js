/*
 * JQuery functions for slideout feedback form
 *
 * Sets up a sliding form on click of a feedback button
 * On submit button will send the data to a php script
 *
 * By http://www.paulund.co.uk
 */
(function ($j) {

  feedback_button = {

    onReady: function () {
      this.feedback_button_click();
    },

    feedback_button_click: function(){
    	$("#feedback_button").click(function(){
    		$('.form').slideToggle();
    	});
    }
  };

  $j().ready(function () {
	  feedback_button.onReady();
  });

})(jQuery);