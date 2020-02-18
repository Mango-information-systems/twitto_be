const d3 = require('d3-selection')

/**
* feed control
* 
* pause / resume realtime stream
*
* @constructor
* 
* @param {object} socket.io connection
* @param {object} button the d3 selection of toggle button
* @param {object} badge the d3 selection of status badge
* @param {object} view app view components
* 
*/
function Control (socket, button, badge, view) {

	let isLive = userPaused = false

	/****************************************
	 *
	 * Private methods
	 *
	 ****************************************/

	/***********
	 *
	 * update status badge and toggle button, based on isLive indicator
	 * 
	 * @param {boolean} byUser flag whether the toggle is caused by the user
	 * 
	 * @private
	 *
	 ************/
	function updateUI(byUser) {
		
		if (!isLive) {
			badge.classed('badge-success', true)
			  .html('live')
			button.html('Pause')
			if (byUser)
				view.force.interruptOverlapPrevention()
		}
		else {
			badge.classed('badge-success', false)
			  .html('paused')
			button.html('Resume')
			view.tweetsPerSecond.pause()
			view.tweetsPerMinute.pause()
			if (byUser)
				view.force.preventOverlap()
		}
		
	}
	
	/***********
	 *
	 * Toggle realtime data stream
	 * 
	 * @param {boolean} byUser flag whether the toggle is caused by the user
	 * 
	 * @private
	 *
	 ************/
	function toggleStream(byUser) {
		
		if (isLive) {
			
			if (byUser)
				userPaused = true
			
			socket.emit('pause')
			
			updateUI(byUser)
			
			isLive = false
		}
		else {
			
			if (byUser || !userPaused) {
			// either user clicked on resume button, or the previous pause 
			// was triggered by the app, not the user
					
				socket.emit('resume')

				updateUI(byUser)
			
				isLive = true
				
				userPaused = false
			}

		}
		
	}
	
	/****************************************
	 *
	 * Public methods
	 *
	 ****************************************/
	
	// activate feature once live feed is connected
	this.activate = function() {
		
		button.attr('disabled', null)
		updateUI(true)
		
		isLive = true
	}
	
	// pause live stream initiated by software (e.g. when tab gets hidden)
	this.pause = function() {
		if (isLive)
			toggleStream(false)
	}
	
	// resume live stream initiated by software (e.g. when tab gets activated)
	this.resume = function() {
		if (!isLive)
			toggleStream(false)
	}
	
	/****************************************
	 *
	 * Event listeners
	 *
	 ****************************************/

	button.on('click', function() {
		toggleStream(true)
	})

}
module.exports = Control
