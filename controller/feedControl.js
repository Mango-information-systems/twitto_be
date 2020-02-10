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

	let isLive


	/****************************************
	 *
	 * Private methods
	 *
	 ****************************************/

	/***********
	 *
	 * update status badge and toggle button, based on isLive indicator
	 * 
	 * @private
	 *
	 ************/
	function updateUI() {
		
		if (isLive) {
			badge.classed('badge-success', true)
			badge.html('live')
			button.html('Pause')
			view.force.interruptOverlapPrevention()
		}
		else {
			badge.classed('badge-success', false)
			badge.html('paused')
			button.html('Resume')
			view.tweetsPerSecond.pause()
			view.tweetsPerMinute.pause()
			view.force.preventOverlap()
		}
		
	}
	
	/***********
	 *
	 * Toggle realtime data stream
	 * 
	 * @private
	 *
	 ************/
	function toggleStream() {
		
		socket.emit(isLive? 'pause' : 'resume')
		
		isLive = !isLive

		updateUI()
		
	}
	
	/****************************************
	 *
	 * Public methods
	 *
	 ****************************************/
	
	this.activate = function() {
		isLive = true
		
		button.attr('disabled', null)
		updateUI()
	}

	button.on('click', function() {
		toggleStream()
	})

}
module.exports = Control
