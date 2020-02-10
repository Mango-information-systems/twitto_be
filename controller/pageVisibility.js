/**
* page visibility management
* 
* @constructor
* 
* @param {object} feedControl controller
* 
*/
function Control (feedControl) {

	let hidden
		, visibilityChange
	
	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
		hidden = "hidden"
		visibilityChange = "visibilitychange"
	}
	else if (typeof document.msHidden !== "undefined") {
		hidden = "msHidden"
		visibilityChange = "msvisibilitychange"
	}
	else if (typeof document.webkitHidden !== "undefined") {
		hidden = "webkitHidden"
		visibilityChange = "webkitvisibilitychange"
	}
	
	/****************************************
	 *
	 * Private methods
	 *
	 ****************************************/
	
	/***********
	 *
	 * toggle live feed
	 * 
	 * @private
	 *
	 ************/
	function handleVisibilityChange() {
		if (document[hidden])
			feedControl.pause()
		else
			feedControl.resume()
	}
	
	/****************************************
	 *
	 * Event listeners
	 *
	 ****************************************/
	
	if (typeof document.addEventListener !== "undefined" && hidden !== undefined) {
	// Handle page visibility change   
		document.addEventListener(visibilityChange, handleVisibilityChange, false)
	}

}
module.exports = Control
