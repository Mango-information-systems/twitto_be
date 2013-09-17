/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo=function(a){return{iStart:a._iDisplayStart,iEnd:a.fnDisplayEnd(),iLength:a._iDisplayLength,iTotal:a.fnRecordsTotal(),iFilteredTotal:a.fnRecordsDisplay(),iPage:Math.ceil(a._iDisplayStart/a._iDisplayLength),iTotalPages:Math.ceil(a.fnRecordsDisplay()/a._iDisplayLength)}},/* Bootstrap style pagination control */
$.extend($.fn.dataTableExt.oPagination,{bootstrap:{fnInit:function(a,i,e){var t=a.oLanguage.oPaginate,l=function(i){i.preventDefault(),a.oApi._fnPageChange(a,i.data.action)&&e(a)}
$(i).addClass("pagination").append('<ul><li class="prev disabled"><a href="#">&larr; '+t.sPrevious+"</a></li>"+'<li class="next disabled"><a href="#">'+t.sNext+" &rarr; </a></li>"+"</ul>")
var n=$("a",i)
$(n[0]).bind("click.DT",{action:"previous"},l),$(n[1]).bind("click.DT",{action:"next"},l)},fnUpdate:function(a,i){var e,t,l,n,s,o=5,r=a.oInstance.fnPagingInfo(),d=a.aanFeatures.p,g=Math.floor(o/2)
for(r.iTotalPages<o?(n=1,s=r.iTotalPages):r.iPage<=g?(n=1,s=o):r.iPage>=r.iTotalPages-g?(n=r.iTotalPages-o+1,s=r.iTotalPages):(n=r.iPage-g+1,s=n+o-1),e=0,iLen=d.length;iLen>e;e++){// Add the new list items and their event handlers
for(// Remove the middle elements
$("li:gt(0)",d[e]).filter(":not(:last)").remove(),t=n;s>=t;t++)l=t==r.iPage+1?'class="active"':"",$("<li "+l+'><a href="#">'+t+"</a></li>").insertBefore($("li:last",d[e])[0]).bind("click",function(e){e.preventDefault(),a._iDisplayStart=(parseInt($("a",this).text(),10)-1)*r.iLength,i(a)});// Add / remove disabled classes from the static elements
0===r.iPage?$("li:first",d[e]).addClass("disabled"):$("li:first",d[e]).removeClass("disabled"),r.iPage===r.iTotalPages-1||0===r.iTotalPages?$("li:last",d[e]).addClass("disabled"):$("li:last",d[e]).removeClass("disabled")}}}})
