/* Set the defaults for DataTables initialisation */
$.extend(!0,$.fn.dataTable.defaults,{sDom:"<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",sPaginationType:"bootstrap",oLanguage:{sLengthMenu:"_MENU_ records per page"}}),/* Default class modification */
$.extend($.fn.dataTableExt.oStdClasses,{sWrapper:"dataTables_wrapper form-inline"}),/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo=function(a){return{iStart:a._iDisplayStart,iEnd:a.fnDisplayEnd(),iLength:a._iDisplayLength,iTotal:a.fnRecordsTotal(),iFilteredTotal:a.fnRecordsDisplay(),iPage:-1===a._iDisplayLength?0:Math.ceil(a._iDisplayStart/a._iDisplayLength),iTotalPages:-1===a._iDisplayLength?0:Math.ceil(a.fnRecordsDisplay()/a._iDisplayLength)}},/* Bootstrap style pagination control */
$.extend($.fn.dataTableExt.oPagination,{bootstrap:{fnInit:function(a,e,i){var t=a.oLanguage.oPaginate,n=function(e){e.preventDefault(),a.oApi._fnPageChange(a,e.data.action)&&i(a)}
$(e).addClass("pagination").append('<ul><li class="prev disabled"><a href="#">&larr; '+t.sPrevious+"</a></li>"+'<li class="next disabled"><a href="#">'+t.sNext+" &rarr; </a></li>"+"</ul>")
var l=$("a",e)
$(l[0]).bind("click.DT",{action:"previous"},n),$(l[1]).bind("click.DT",{action:"next"},n)},fnUpdate:function(a,e){var i,t,n,l,s,o,r=5,d=a.oInstance.fnPagingInfo(),f=a.aanFeatures.p,g=Math.floor(r/2)
for(d.iTotalPages<r?(s=1,o=d.iTotalPages):d.iPage<=g?(s=1,o=r):d.iPage>=d.iTotalPages-g?(s=d.iTotalPages-r+1,o=d.iTotalPages):(s=d.iPage-g+1,o=s+r-1),i=0,t=f.length;t>i;i++){// Add the new list items and their event handlers
for(// Remove the middle elements
$("li:gt(0)",f[i]).filter(":not(:last)").remove(),n=s;o>=n;n++)l=n==d.iPage+1?'class="active"':"",$("<li "+l+'><a href="#">'+n+"</a></li>").insertBefore($("li:last",f[i])[0]).bind("click",function(i){i.preventDefault(),a._iDisplayStart=(parseInt($("a",this).text(),10)-1)*d.iLength,e(a)});// Add / remove disabled classes from the static elements
0===d.iPage?$("li:first",f[i]).addClass("disabled"):$("li:first",f[i]).removeClass("disabled"),d.iPage===d.iTotalPages-1||0===d.iTotalPages?$("li:last",f[i]).addClass("disabled"):$("li:last",f[i]).removeClass("disabled")}}}}),/*
 * TableTools Bootstrap compatibility
 * Required TableTools 2.1+
 */
$.fn.DataTable.TableTools&&(// Set the classes that TableTools uses to something suitable for Bootstrap
$.extend(!0,$.fn.DataTable.TableTools.classes,{container:"DTTT btn-group",buttons:{normal:"btn",disabled:"disabled"},collection:{container:"DTTT_dropdown dropdown-menu",buttons:{normal:"",disabled:"disabled"}},print:{info:"DTTT_print_info modal"},select:{row:"active"}}),// Have the collection use a bootstrap compatible dropdown
$.extend(!0,$.fn.DataTable.TableTools.DEFAULTS.oTags,{collection:{container:"ul",button:"li",liner:"a"}}))
