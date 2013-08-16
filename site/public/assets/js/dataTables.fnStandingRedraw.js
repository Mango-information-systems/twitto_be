// dataTables plugin by Jonathan Hoguet
$.fn.dataTableExt.oApi.fnStandingRedraw = function(oSettings) {
    if(oSettings.oFeatures.bServerSide === false){
        var before = oSettings._iDisplayStart;
 
        oSettings.oApi._fnReDraw(oSettings);
 
        // iDisplayStart has been reset to zero - so lets change it back
        oSettings._iDisplayStart = before;
        oSettings.oApi._fnCalculateEnd(oSettings);
    }
      
    // draw the 'current' page
    oSettings.oApi._fnDraw(oSettings);
};
