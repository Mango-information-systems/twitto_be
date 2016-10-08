function UtilsClient() {

	var state

	switch(true) {
		case typeof document.hidden !== 'undefined':
			state = 'visibilityState'
		break
		case typeof document.mozHidden !== 'undefined':
			state = 'mozVisibilityState'
		break
		case typeof document.msHidden !== 'undefined':
			state = 'msVisibilityState'
		break
		case typeof document.webkitHidden !== 'undefined':
			state = 'webkitVisibilityState'
		break
	}


	/***********
	 *
	 * Check if tab has focus
	 * 
	 * @return {boolean} is tab active
	 *
	 ************/
	this.isTabActive = function () {

		var isVisible = true

		if(document[state] == 'hidden'){
			document.title = 'Inactive' //temp
			isVisible = false
		}
		else {
			document.title = 'Active' //temp
		}

		return isVisible

	}

}

module.exports = UtilsClient
