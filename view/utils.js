function Utils() {

	/***********
	 *
	 * Check if tab has focus
	 *
	 ************/
	this.isTabActive = function () {


		var hidden
			, state
			, isVisible = true

		if(typeof document.hidden !== 'undefined') {
			state = 'visibilityState'
		} else if(typeof document.mozHidden !== 'undefined') {
			state = 'mozVisibilityState'
		} else if(typeof document.msHidden !== 'undefined') {
			state = 'msVisibilityState'
		} else if(typeof document.webkitHidden !== 'undefined') {
			state = 'webkitVisibilityState'
		}


		if(document[state] == 'hidden'){
			document.title = 'Inactive'
			isVisible = false
		} else {
			document.title = 'Active'
		}

		return isVisible


	}

}

module.exports = Utils