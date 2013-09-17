// dataTables plugin by Jonathan Hoguet
$.fn.dataTableExt.oApi.fnStandingRedraw=function(a){if(a.oFeatures.bServerSide===!1){var i=a._iDisplayStart
a.oApi._fnReDraw(a),// iDisplayStart has been reset to zero - so lets change it back
a._iDisplayStart=i,a.oApi._fnCalculateEnd(a)}// draw the 'current' page
a.oApi._fnDraw(a)}
