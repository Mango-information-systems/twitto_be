/*
 *  Copyright 2012 the original author or authors.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
dc={version:"1.4.0",constants:{CHART_CLASS:"dc-chart",DEBUG_GROUP_CLASS:"debug",STACK_CLASS:"stack",DESELECTED_CLASS:"deselected",SELECTED_CLASS:"selected",NODE_INDEX_NAME:"__index__",GROUP_INDEX_NAME:"__group_index__",DEFAULT_CHART_GROUP:"__default_chart_group__",EVENT_DELAY:40,NEGLIGIBLE_NUMBER:1e-10},_renderlet:null},dc.chartRegistry=function(){function t(t){return t||(t=dc.constants.DEFAULT_CHART_GROUP),n[t]||(n[t]=[]),t}// chartGroup:string => charts:array
var n={}
return this.has=function(t){for(var e in n)if(n[e].indexOf(t)>=0)return!0
return!1},this.register=function(e,r){r=t(r),n[r].push(e)},this.clear=function(){n={}},this.list=function(e){return e=t(e),n[e]},this}(),dc.registerChart=function(t,n){dc.chartRegistry.register(t,n)},dc.hasChart=function(t){return dc.chartRegistry.has(t)},dc.deregisterAllCharts=function(){dc.chartRegistry.clear()},dc.filterAll=function(t){for(var n=dc.chartRegistry.list(t),e=0;e<n.length;++e)n[e].filterAll()},dc.renderAll=function(t){for(var n=dc.chartRegistry.list(t),e=0;e<n.length;++e)n[e].render()
null!==dc._renderlet&&dc._renderlet(t)},dc.redrawAll=function(t){for(var n=dc.chartRegistry.list(t),e=0;e<n.length;++e)n[e].redraw()
null!==dc._renderlet&&dc._renderlet(t)},dc.transition=function(t,n,e){if(0>=n||void 0===n)return t
var r=t.transition().duration(n)
return e instanceof Function&&e(r),r},dc.units={},dc.units.integers=function(t,n){return Math.abs(n-t)},dc.units.ordinal=function(t,n,e){return e},dc.units.float={},dc.units.float.precision=function(t){var n=function(t,e){return Math.ceil(Math.abs((e-t)/n.resolution))}
return n.resolution=t,n},dc.round={},dc.round.floor=function(t){return Math.floor(t)},dc.round.ceil=function(t){return Math.ceil(t)},dc.round.round=function(t){return Math.round(t)},dc.override=function(t,n,e){var r=t[n]
t["_"+n]=r,t[n]=e},dc.renderlet=function(t){return arguments.length?(dc._renderlet=t,dc):dc._renderlet},dc.instanceOfChart=function(t){return t instanceof Object&&t.__dc_flag__},dc.errors={},dc.errors.Exception=function(t){var n=null!=t?t:"Unexpected internal error"
this.message=n,this.toString=function(){return n}},dc.errors.InvalidStateException=function(){dc.errors.Exception.apply(this,arguments)},dc.dateFormat=d3.time.format("%m/%d/%Y"),dc.printers={},dc.printers.filters=function(t){for(var n="",e=0;e<t.length;++e)e>0&&(n+=", "),n+=dc.printers.filter(t[e])
return n},dc.printers.filter=function(t){var n=""
return t&&(t instanceof Array?t.length>=2?n="["+dc.utils.printSingleValue(t[0])+" -> "+dc.utils.printSingleValue(t[1])+"]":t.length>=1&&(n=dc.utils.printSingleValue(t[0])):n=dc.utils.printSingleValue(t)),n},dc.utils={},dc.utils.printSingleValue=function(t){var n=""+t
return t instanceof Date?n=dc.dateFormat(t):"string"==typeof t?n=t:"number"==typeof t&&(n=Math.round(t)),n},dc.utils.add=function(t,n){if("string"==typeof n&&(n=n.replace("%","")),t instanceof Date){"string"==typeof n&&(n=+n)
var e=new Date
return e.setTime(t.getTime()),e.setDate(t.getDate()+n),e}if("string"==typeof n){var r=+n/100
return t>0?t*(1+r):t*(1-r)}return t+n},dc.utils.subtract=function(t,n){if("string"==typeof n&&(n=n.replace("%","")),t instanceof Date){"string"==typeof n&&(n=+n)
var e=new Date
return e.setTime(t.getTime()),e.setDate(t.getDate()-n),e}if("string"==typeof n){var r=+n/100
return 0>t?t*(1+r):t*(1-r)}return t-n},dc.utils.GroupStack=function(){function t(t){e[t]||(e[t]=[])}var n,e=[],r=[]
this.setDataPoint=function(n,r,i){t(n),e[n][r]=i},this.getDataPoint=function(n,r){t(n)
var i=e[n][r]
return void 0==i&&(i=0),i},this.addGroup=function(t,e){return e||(e=n),r.push([t,e]),r.length-1},this.getGroupByIndex=function(t){return r[t][0]},this.getAccessorByIndex=function(t){return r[t][1]},this.size=function(){return r.length},this.clear=function(){e=[],r=[]},this.setDefaultAccessor=function(t){n=t},this.getDataPoints=function(){return e}},dc.utils.isNegligible=function(t){return void 0===t||t<dc.constants.NEGLIGIBLE_NUMBER&&t>-dc.constants.NEGLIGIBLE_NUMBER},dc.utils.groupMax=function(t,n){var e=d3.max(t.all(),function(t){return n(t)})
return dc.utils.isNegligible(e)&&(e=0),e},dc.utils.groupMin=function(t,n){var e=d3.min(t.all(),function(t){return n(t)})
return dc.utils.isNegligible(e)&&(e=0),e},dc.utils.nameToId=function(t){return t.toLowerCase().replace(/[\s]/g,"_").replace(/[\.']/g,"")},dc.utils.appendOrSelect=function(t,n){var e=t.select(n)
return e.empty()&&(e=t.append(n)),e},dc.events={current:null},dc.events.trigger=function(t,n){return n?(dc.events.current=t,setTimeout(function(){t==dc.events.current&&t()},n),void 0):(t(),void 0)},dc.cumulative={},dc.cumulative.Base=function(){this._keyIndex=[],this._map={},this.sanitizeKey=function(t){return t+=""},this.clear=function(){this._keyIndex=[],this._map={}},this.size=function(){return this._keyIndex.length},this.getValueByKey=function(t){t=this.sanitizeKey(t)
var n=this._map[t]
return n},this.setValueByKey=function(t,n){return t=this.sanitizeKey(t),this._map[t]=n},this.indexOfKey=function(t){return t=this.sanitizeKey(t),this._keyIndex.indexOf(t)},this.addToIndex=function(t){t=this.sanitizeKey(t),this._keyIndex.push(t)},this.getKeyByIndex=function(t){return this._keyIndex[t]}},dc.cumulative.Sum=function(){dc.cumulative.Base.apply(this,arguments),this.add=function(t,n){null==n&&(n=0),null==this.getValueByKey(t)?(this.addToIndex(t),this.setValueByKey(t,n)):this.setValueByKey(t,this.getValueByKey(t)+n)},this.minus=function(t,n){this.setValueByKey(t,this.getValueByKey(t)-n)},this.cumulativeSum=function(t){var n=this.indexOfKey(t)
if(0>n)return 0
for(var e=0,r=0;n>=r;++r){var i=this.getKeyByIndex(r)
e+=this.getValueByKey(i)}return e}},dc.cumulative.Sum.prototype=new dc.cumulative.Base,dc.cumulative.CountUnique=function(){function t(t){var n,e=0
for(n in t)t.hasOwnProperty(n)&&e++
return e}dc.cumulative.Base.apply(this,arguments),this.add=function(t,n){null==this.getValueByKey(t)&&(this.setValueByKey(t,{}),this.addToIndex(t)),null!=n&&(null==this.getValueByKey(t)[n]&&(this.getValueByKey(t)[n]=0),this.getValueByKey(t)[n]+=1)},this.minus=function(t,n){this.getValueByKey(t)[n]-=1,this.getValueByKey(t)[n]<=0&&delete this.getValueByKey(t)[n]},this.count=function(n){return t(this.getValueByKey(n))},this.cumulativeCount=function(t){var n=this.indexOfKey(t)
if(0>n)return 0
for(var e=0,r=0;n>=r;++r){var i=this.getKeyByIndex(r)
e+=this.count(i)}return e}},dc.cumulative.CountUnique.prototype=new dc.cumulative.Base,dc.baseChart=function(t){function n(t){S.splice(S.indexOf(t),1),i()}function e(n){S.push(n),i(),t.invokeFilteredListener(t,n)}function r(){S=[],i(),t.invokeFilteredListener(t,null)}function i(){if(t.dataSet()&&void 0!=t.dimension().filter){var n=E(t.dimension(),S)
S=n?n:S}}function a(){for(var n=0;n<b.length;++n)b[n](t)}t.__dc_flag__=!0
var u,c,o,s,l,d=200,f=200,g=function(t){return t.key},h=function(t){return t.value},p=function(t){return t.key},v=!1,x=function(t){return t.key+": "+t.value},m=!1,y=750,A=dc.printers.filters,b=[],C=dc.constants.DEFAULT_CHART_GROUP,D=function(){},_={preRender:D,postRender:D,preRedraw:D,postRedraw:D,filtered:D,zoomed:D},S=[],E=function(t,n){return t.filter(null),0==n.length?t.filter(null):1==n.length?t.filter(n[0]):t.filterFunction(function(t){return n.indexOf(t)>=0}),n}
return t.width=function(n){return arguments.length?(d=n,t):d},t.height=function(n){return arguments.length?(f=n,t):f},t.dimension=function(n){return arguments.length?(u=n,t.expireCache(),t):u},t.group=function(n){return arguments.length?(c=n,t.expireCache(),t):c},t.orderedGroup=function(){return c.order(function(t){return t.key})},t.filterAll=function(){return t.filter(null)},t.dataSet=function(){return void 0!=u&&void 0!=c},t.select=function(t){return s.select(t)},t.selectAll=function(t){return s?s.selectAll(t):null},t.anchor=function(n,e){return arguments.length?(dc.instanceOfChart(n)?(o=n.anchor(),s=n.root()):(o=n,s=d3.select(o),s.classed(dc.constants.CHART_CLASS,!0),dc.registerChart(t,e)),C=e,t):o},t.root=function(n){return arguments.length?(s=n,t):s},t.svg=function(n){return arguments.length?(l=n,t):l},t.resetSvg=function(){return t.select("svg").remove(),t.generateSvg()},t.generateSvg=function(){return l=t.root().append("svg").attr("width",t.width()).attr("height",t.height())},t.filterPrinter=function(n){return arguments.length?(A=n,t):A},t.turnOnControls=function(){return s&&(t.selectAll(".reset").style("display",null),t.selectAll(".filter").text(A(t.filters())).style("display",null)),t},t.turnOffControls=function(){return s&&(t.selectAll(".reset").style("display","none"),t.selectAll(".filter").style("display","none").text(t.filter())),t},t.transitionDuration=function(n){return arguments.length?(y=n,t):y},t.render=function(){if(_.preRender(t),null==u)throw new dc.errors.InvalidStateException("Mandatory attribute chart.dimension is missing on chart["+t.anchor()+"]")
if(null==c)throw new dc.errors.InvalidStateException("Mandatory attribute chart.group is missing on chart["+t.anchor()+"]")
var n=t.doRender()
return t.activateRenderlets("postRender"),n},t.activateRenderlets=function(n){t.transitionDuration()>0&&l?l.transition().duration(t.transitionDuration()).each("end",function(){a(),n&&_[n](t)}):(a(),n&&_[n](t))},t.redraw=function(){_.preRedraw(t)
var n=t.doRedraw()
return t.activateRenderlets("postRedraw"),n},t.invokeFilteredListener=function(n,e){void 0!==e&&_.filtered(t,e)},t.invokeZoomedListener=function(){_.zoomed(t)},t.hasFilter=function(t){return arguments.length?S.indexOf(t)>=0:S.length>0},t.filter=function(i){return arguments.length?(null==i?r():t.hasFilter(i)?n(i):e(i),null!=s&&t.hasFilter()?t.turnOnControls():t.turnOffControls(),t):S.length>0?S[0]:null},t.filters=function(){return S},t.highlightSelected=function(t){d3.select(t).classed(dc.constants.SELECTED_CLASS,!0),d3.select(t).classed(dc.constants.DESELECTED_CLASS,!1)},t.fadeDeselected=function(t){d3.select(t).classed(dc.constants.SELECTED_CLASS,!1),d3.select(t).classed(dc.constants.DESELECTED_CLASS,!0)},t.resetHighlight=function(t){d3.select(t).classed(dc.constants.SELECTED_CLASS,!1),d3.select(t).classed(dc.constants.DESELECTED_CLASS,!1)},t.onClick=function(n){var e=t.keyAccessor()(n)
dc.events.trigger(function(){t.filter(e),dc.redrawAll(t.chartGroup())})},t.filterHandler=function(n){return arguments.length?(E=n,t):E},// abstract function stub
t.doRender=function(){// do nothing in base, should be overridden by sub-function
return t},t.doRedraw=function(){// do nothing in base, should be overridden by sub-function
return t},t.keyAccessor=function(n){return arguments.length?(g=n,t):g},t.valueAccessor=function(n){return arguments.length?(h=n,t):h},t.label=function(n){return arguments.length?(p=n,v=!0,t):p},t.renderLabel=function(n){return arguments.length?(v=n,t):v},t.title=function(n){return arguments.length?(x=n,m=!0,t):x},t.renderTitle=function(n){return arguments.length?(m=n,t):m},t.renderlet=function(n){return b.push(n),t},t.chartGroup=function(n){return arguments.length?(C=n,t):C},t.on=function(n,e){return _[n]=e,t},t.expireCache=function(){// do nothing in base, should be overridden by sub-function
return t},t},dc.marginable=function(t){var n={top:10,right:50,bottom:30,left:30}
return t.margins=function(e){return arguments.length?(n=e,t):n},t.effectiveWidth=function(){return t.width()-t.margins().left-t.margins().right},t.effectiveHeight=function(){return t.height()-t.margins().top-t.margins().bottom},t},dc.coordinateGridChart=function(t){function n(n){t.elasticX()&&!t.isOrdinal()&&b.domain([t.xAxisMin(),t.xAxisMax()]),t.isOrdinal()?t.prepareOrdinalXAxis():b.range([0,t.xAxisLength()]),L=L.scale(t.x()).orient("bottom"),e(n)}function e(n){if(I){var e=n.selectAll("g."+x)
e.empty()&&(e=n.insert("g",":first-child").attr("class",p+" "+x).attr("transform","translate("+t.yAxisX()+","+t.margins().top+")"))
var r=L.tickValues()?L.tickValues():b.ticks(L.ticks()[0]),i=e.selectAll("line").data(r),a=i.enter().append("line").attr("x1",function(t){return b(t)}).attr("y1",t.xAxisY()-t.margins().top).attr("x2",function(t){return b(t)}).attr("y2",0).attr("opacity",0)
dc.transition(a,t.transitionDuration()).attr("opacity",1),// update
dc.transition(i,t.transitionDuration()).attr("x1",function(t){return b(t)}).attr("y1",t.xAxisY()-t.margins().top).attr("x2",function(t){return b(t)}).attr("y2",0),// exit
i.exit().remove()}}function r(n){(null==D||t.elasticY())&&(D=d3.scale.linear(),D.domain([t.yAxisMin(),t.yAxisMax()]).rangeRound([t.yAxisHeight(),0])),D.range([t.yAxisHeight(),0]),N=N.scale(D).orient("left").ticks(h),i(n)}function i(n){if(T){var e=n.selectAll("g."+v),r=N.tickValues()?N.tickValues():D.ticks(N.ticks()[0])
e.empty()&&(e=n.insert("g",":first-child").attr("class",p+" "+v).attr("transform","translate("+t.yAxisX()+","+t.margins().top+")"))
var i=e.selectAll("line").data(r),a=i.enter().append("line").attr("x1",1).attr("y1",function(t){return D(t)}).attr("x2",t.xAxisLength()).attr("y2",function(t){return D(t)}).attr("opacity",0)
dc.transition(a,t.transitionDuration()).attr("opacity",1),// update
dc.transition(i,t.transitionDuration()).attr("x1",1).attr("y1",function(t){return D(t)}).attr("x2",t.xAxisLength()).attr("y2",function(t){return D(t)}),// exit
i.exit().remove()}}function a(){return t.xAxisY()-t.margins().top}function u(){}function c(){var n=t.extendBrush()
t.redrawBrush(y),t.brushIsEmpty(n)?dc.events.trigger(function(){t.filter(null),dc.redrawAll(t.chartGroup())}):dc.events.trigger(function(){t.filter(null),t.filter([n[0],n[1]]),dc.redrawAll(t.chartGroup())},dc.constants.EVENT_DELAY)}function o(){}function s(){return t.anchor().replace("#","")+"-clip"}function l(){var n=dc.utils.appendOrSelect(m,"defs"),e=dc.utils.appendOrSelect(n,"clipPath").attr("id",s())
dc.utils.appendOrSelect(e,"rect").attr("x",t.margins().left-K).attr("y",t.margins().top-K).attr("width",t.xAxisLength()+2*K).attr("height",t.yAxisHeight()+2*K)}function d(){V&&t.root().call(d3.behavior.zoom().x(t.x()).scaleExtent([1,100]).on("zoom",function(){t.focus(t.x().domain()),t.invokeZoomedListener(t),f()}))}function f(){if(E){var n=t.x().domain(),e=E.xOriginalDomain(),r=[n[0]<e[0]?n[0]:e[0],n[1]>e[1]?n[1]:e[1]]
E.focus(r),E.filter(null),E.filter(n),dc.events.trigger(function(){dc.redrawAll(t.chartGroup())})}}function g(t){return null!=t&&void 0!=t&&t instanceof Array&&t.length>1}var h=5,p="grid-line",v="horizontal",x="vertical"
t=dc.marginable(dc.baseChart(t))
var m,y,A,b,C,D,_,S,E,B,L=d3.svg.axis(),k=dc.units.integers,R=0,M=!1,N=d3.svg.axis(),G=0,w=!1,O=d3.svg.brush(),P=!0,T=!1,I=!1,U=!1,V=!1,K=5
return t.resetUnitCount=function(){S=null,t.xUnitCount()},t.rangeChart=function(n){return arguments.length?(E=n,E.focusChart(t),t):E},t.generateG=function(n){return m=null==n?t.svg():n,y=m.append("g"),A=y.append("g").attr("class","chartBody").attr("clip-path","url(#"+s()+")"),y},t.g=function(n){return arguments.length?(y=n,t):y},t.mouseZoomable=function(n){return arguments.length?(V=n,t):V},t.chartBodyG=function(n){return arguments.length?(A=n,t):A},t.x=function(n){return arguments.length?(b=n,C=b.domain(),t):b},t.xOriginalDomain=function(){return C},t.xUnits=function(n){return arguments.length?(k=n,t):k},t.xAxis=function(n){return arguments.length?(L=n,t):L},t.elasticX=function(n){return arguments.length?(M=n,t):M},t.xAxisPadding=function(n){return arguments.length?(R=n,t):R},t.xUnitCount=function(){if(null==S){var n=t.xUnits()(t.x().domain()[0],t.x().domain()[1],t.x().domain())
S=n instanceof Array?n.length:n}return S},t.isOrdinal=function(){return t.xUnits()===dc.units.ordinal},t.prepareOrdinalXAxis=function(n){n||(n=t.xUnitCount())
for(var e=[],r=0,i=t.xAxisLength()/n,a=0;n>a;a++)e[a]=r,r+=i
b.range(e)},t.renderXAxis=function(n){var e=n.selectAll("g.x")
e.empty()&&(e=n.append("g").attr("class","axis x").attr("transform","translate("+t.margins().left+","+t.xAxisY()+")")),dc.transition(e,t.transitionDuration()).call(L)},t.xAxisY=function(){return t.height()-t.margins().bottom},t.xAxisLength=function(){return t.effectiveWidth()},t.renderYAxis=function(n){var e=n.selectAll("g.y")
e.empty()&&(e=n.append("g").attr("class","axis y").attr("transform","translate("+t.yAxisX()+","+t.margins().top+")")),dc.transition(e,t.transitionDuration()).call(N)},t.yAxisX=function(){return t.margins().left},t.y=function(n){return arguments.length?(D=n,t):D},t.yAxis=function(n){return arguments.length?(N=n,t):N},t.elasticY=function(n){return arguments.length?(w=n,t):w},t.renderHorizontalGridLines=function(n){return arguments.length?(T=n,t):T},t.renderVerticalGridLines=function(n){return arguments.length?(I=n,t):I},t.xAxisMin=function(){var n=d3.min(t.group().all(),function(n){return t.keyAccessor()(n)})
return dc.utils.subtract(n,R)},t.xAxisMax=function(){var n=d3.max(t.group().all(),function(n){return t.keyAccessor()(n)})
return dc.utils.add(n,R)},t.yAxisMin=function(){var n=d3.min(t.group().all(),function(n){return t.valueAccessor()(n)})
return n=dc.utils.subtract(n,G)},t.yAxisMax=function(){var n=d3.max(t.group().all(),function(n){return t.valueAccessor()(n)})
return n=dc.utils.add(n,G)},t.yAxisPadding=function(n){return arguments.length?(G=n,t):G},t.yAxisHeight=function(){return t.effectiveHeight()},t.round=function(n){return arguments.length?(_=n,t):_},dc.override(t,"filter",function(n){return arguments.length?(t._filter(n),n?t.brush().extent(n):t.brush().clear(),t):t._filter()}),t.brush=function(n){return arguments.length?(O=n,t):O},t.renderBrush=function(n){if(t.isOrdinal()&&(P=!1),P){O.on("brushstart",u).on("brush",c).on("brushend",o)
var e=n.append("g").attr("class","brush").attr("transform","translate("+t.margins().left+","+t.margins().top+")").call(O.x(t.x()))
e.selectAll("rect").attr("height",a()),e.selectAll(".resize").append("path").attr("d",t.resizeHandlePath),t.hasFilter()&&t.redrawBrush(n)}},t.extendBrush=function(){var n=O.extent()
return t.round()&&(n[0]=n.map(t.round())[0],n[1]=n.map(t.round())[1],y.select(".brush").call(O.extent(n))),n},t.brushIsEmpty=function(t){return O.empty()||!t||t[1]<=t[0]},t.redrawBrush=function(n){if(P){t.filter()&&t.brush().empty()&&t.brush().extent(t.filter())
var e=n.select("g.brush")
e.call(t.brush().x(t.x())),e.selectAll("rect").attr("height",a())}t.fadeDeselectedArea()},t.fadeDeselectedArea=function(){},// borrowed from Crossfilter example
t.resizeHandlePath=function(t){var n=+("e"==t),e=n?1:-1,r=a()/3
return"M"+.5*e+","+r+"A6,6 0 0 "+n+" "+6.5*e+","+(r+6)+"V"+(2*r-6)+"A6,6 0 0 "+n+" "+.5*e+","+2*r+"Z"+"M"+2.5*e+","+(r+8)+"V"+(2*r-8)+"M"+4.5*e+","+(r+8)+"V"+(2*r-8)},t.clipPadding=function(n){return arguments.length?(K=n,t):K},t.doRender=function(){if(null==b)throw new dc.errors.InvalidStateException("Mandatory attribute chart.x is missing on chart["+t.anchor()+"]")
return t.resetSvg(),t.dataSet()&&(t.generateG(),l(),n(t.g()),r(t.g()),t.plotData(),t.renderXAxis(t.g()),t.renderYAxis(t.g()),t.renderBrush(t.g()),d()),t},t.doRedraw=function(){return n(t.g()),r(t.g()),t.plotData(),t.elasticY()&&t.renderYAxis(t.g()),(t.elasticX()||U)&&t.renderXAxis(t.g()),t.redrawBrush(t.g()),t},t.subRender=function(){return t.dataSet()&&t.plotData(),t},t.brushOn=function(n){return arguments.length?(P=n,t):P},t.getDataWithinXDomain=function(n){var e=[]
return t.isOrdinal()?e=n.all():n.all().forEach(function(n){var r=t.keyAccessor()(n)
r>=t.x().domain()[0]&&r<=t.x().domain()[1]&&e.push(n)}),e},t.focus=function(n){U=!0,g(n)?t.x().domain(n):t.x().domain(t.xOriginalDomain()),void 0!==t.resetUnitCount&&t.resetUnitCount(),void 0!==t.resetBarProperties&&t.resetBarProperties(),t.redraw(),g(n)||(U=!1)},t.refocused=function(){return U},t.focusChart=function(n){return arguments.length?(B=n,t.on("filtered",function(t){dc.events.trigger(function(){B.focus(t.filter()),dc.redrawAll(t.chartGroup())})}),t):B},t},dc.colorChart=function(t){var n=d3.scale.category20c(),e=[0,n.range().length],r=function(r){var i=e[0],a=e[1]
if(isNaN(r)&&(r=0),null==a)return n(r)
var u=t.colors().range().length,c=(a-i)/u,o=Math.abs(Math.min(u-1,Math.round((r-i)/c)))
return t.colors()(o)},i=function(t,n){return n}
return t.colors=function(r){if(!arguments.length)return n
if(r instanceof Array){n=d3.scale.ordinal().range(r)
for(var i=[],a=0;a<r.length;++a)i.push(a)
n.domain(i)}else n=r
return e=[0,n.range().length],t},t.colorCalculator=function(n){return arguments.length?(r=n,t):r},t.getColor=function(t,n){return r(i(t,n))},t.colorAccessor=function(n){return arguments.length?(i=n,t):i},t.colorDomain=function(n){return arguments.length?(e=n,t):e},t},dc.stackableChart=function(t){function n(n,e){return t.getValueAccessorByIndex(n)(e)}function e(e,r){for(var i=0;i<e.length;++i){var a=e[i],u=n(r,a),o=1e-13
0==r?u>o?c.setDataPoint(r,i,t.dataPointBaseline()-t.dataPointHeight(a,r)):c.setDataPoint(r,i,t.dataPointBaseline()):u>o?c.setDataPoint(r,i,c.getDataPoint(r-1,i)-t.dataPointHeight(a,r)):-o>u?c.setDataPoint(r,i,c.getDataPoint(r-1,i)+t.dataPointHeight(a,r-1)):// value ~= 0
c.setDataPoint(r,i,c.getDataPoint(r-1,i))}}var r,i,a,u=0,c=new dc.utils.GroupStack
return t.stack=function(n,e){return c.setDefaultAccessor(t.valueAccessor()),c.addGroup(n,e),t.expireCache(),t},t.expireCache=function(){return r=null,i=null,a=null,t},t.allGroups=function(){if(null==r){r=[],r.push(t.group())
for(var n=0;n<c.size();++n)r.push(c.getGroupByIndex(n))}return r},t.allValueAccessors=function(){if(null==i){i=[],i.push(t.valueAccessor())
for(var n=0;n<c.size();++n)i.push(c.getAccessorByIndex(n))}return i},t.getValueAccessorByIndex=function(n){return t.allValueAccessors()[n]},t.yAxisMin=function(){for(var n=0,e=t.allGroups(),r=0;r<e.length;++r){var i=e[r],a=dc.utils.groupMin(i,t.getValueAccessorByIndex(r))
n>a&&(n=a)}if(0>n){n=0
for(var r=0;r<e.length;++r){var i=e[r]
n+=dc.utils.groupMin(i,t.getValueAccessorByIndex(r))}}return n=dc.utils.subtract(n,t.yAxisPadding())},t.yAxisMax=function(){for(var n=0,e=t.allGroups(),r=0;r<e.length;++r){var i=e[r]
n+=dc.utils.groupMax(i,t.getValueAccessorByIndex(r))}return n=dc.utils.add(n,t.yAxisPadding())},t.allKeyAccessors=function(){if(null==a){a=[],a.push(t.keyAccessor())
for(var n=0;n<c.size();++n)a.push(t.keyAccessor())}return a},t.getKeyAccessorByIndex=function(n){return t.allKeyAccessors()[n]},t.xAxisMin=function(){for(var n=null,e=t.allGroups(),r=0;r<e.length;++r){var i=e[r],a=dc.utils.groupMin(i,t.getKeyAccessorByIndex(r));(null==n||n>a)&&(n=a)}return dc.utils.subtract(n,t.xAxisPadding())},t.xAxisMax=function(){for(var n=null,e=t.allGroups(),r=0;r<e.length;++r){var i=e[r],a=dc.utils.groupMax(i,t.getKeyAccessorByIndex(r));(null==n||a>n)&&(n=a)}return dc.utils.add(n,t.xAxisPadding())},t.baseLineY=function(){return t.y()(0)},t.dataPointBaseline=function(){return t.margins().top+t.baseLineY()},t.dataPointHeight=function(e,r){var i=n(r,e),a=t.y()(i),c=t.baseLineY(),o=0
return o=i>0?c-a:a-c,(isNaN(o)||u>o)&&(o=u),o},t.calculateDataPointMatrixForAll=function(t){for(var n=0;n<t.length;++n){var r=t[n],i=r.all()
e(i,n)}},t.calculateDataPointMatrixWithinXDomain=function(n){for(var r=0;r<n.length;++r){var i=n[r],a=t.getDataWithinXDomain(i)
e(a,r)}},t.getChartStack=function(){return c},dc.override(t,"valueAccessor",function(n){return arguments.length?(t.expireCache(),t._valueAccessor(n)):t._valueAccessor()}),dc.override(t,"keyAccessor",function(n){return arguments.length?(t.expireCache(),t._keyAccessor(n)):t._keyAccessor()}),t},dc.abstractBubbleChart=function(t){var n=.3,e=10
t.BUBBLE_NODE_CLASS="node",t.BUBBLE_CLASS="bubble",t.MIN_RADIUS=10,t=dc.colorChart(t),t.renderLabel(!0),t.renderTitle(!1)
var r=d3.scale.linear().domain([0,100]),i=function(t){return t.r}
t.r=function(n){return arguments.length?(r=n,t):r},t.radiusValueAccessor=function(n){return arguments.length?(i=n,t):i},t.rMin=function(){var n=d3.min(t.group().all(),function(n){return t.radiusValueAccessor()(n)})
return n},t.rMax=function(){var n=d3.max(t.group().all(),function(n){return t.radiusValueAccessor()(n)})
return n},t.bubbleR=function(n){var e=t.radiusValueAccessor()(n),r=t.r()(e)
return(isNaN(r)||0>=e)&&(r=0),r}
var a=function(n){return t.label()(n)},u=function(n){return t.bubbleR(n)>e?1:0}
t.doRenderLabel=function(n){if(t.renderLabel()){var e=n.select("text")
e.empty()&&(e=n.append("text").attr("text-anchor","middle").attr("dy",".3em").on("click",t.onClick)),e.attr("opacity",0).text(a),dc.transition(e,t.transitionDuration()).attr("opacity",u)}},t.doUpdateLabels=function(n){if(t.renderLabel()){var e=n.selectAll("text").text(a)
dc.transition(e,t.transitionDuration()).attr("opacity",u)}}
var c=function(n){return t.title()(n)}
return t.doRenderTitles=function(n){if(t.renderTitle()){var e=n.select("title")
e.empty()&&n.append("title").text(c)}},t.doUpdateTitles=function(n){t.renderTitle()&&n.selectAll("title").text(c)},t.minRadiusWithLabel=function(n){return arguments.length?(e=n,t):e},t.maxBubbleRelativeSize=function(e){return arguments.length?(n=e,t):n},t.initBubbleColor=function(n,e){return this[dc.constants.NODE_INDEX_NAME]=e,t.getColor(n,e)},t.updateBubbleColor=function(n){// a work around to get correct node index since
return t.getColor(n,this[dc.constants.NODE_INDEX_NAME])},t.fadeDeselectedArea=function(){t.hasFilter()?t.selectAll("g."+t.BUBBLE_NODE_CLASS).each(function(n){t.isSelectedNode(n)?t.highlightSelected(this):t.fadeDeselected(this)}):t.selectAll("g."+t.BUBBLE_NODE_CLASS).each(function(){t.resetHighlight(this)})},t.isSelectedNode=function(n){return t.hasFilter(n.key)},t.onClick=function(n){var e=n.key
dc.events.trigger(function(){t.filter(e),dc.redrawAll(t.chartGroup())})},t},dc.pieChart=function(t,n){function e(){if(1/0==k)return L.orderedGroup().top(k)
var t=L.group().top(k),n=d3.sum(t,L.valueAccessor()),e=L.group().all(),r=d3.sum(e,L.valueAccessor())
return M(t,r-n),t}function r(){if(L.dataSet()){var t=p(),n=L.buildArcs(),r=t(e())
if(C){var a=C.selectAll("g."+_).data(r)
i(a,n,r),s(r,n),g(a),h()}}}function i(t,n,e){var r=a(t)
u(r,n),c(r),o(e,n)}function a(t){var n=t.enter().append("g").attr("class",function(t,n){return _+" _"+n})
return n}function u(t,n){var e=t.append("path").attr("fill",function(t,n){return L.getColor(t,n)}).on("click",A).attr("d",function(t,e){return b(t,e,n)})
e.transition().duration(L.transitionDuration()).attrTween("d",m)}function c(t){L.renderTitle()&&t.append("title").text(function(t){return L.title()(t)})}function o(t,n){if(L.renderLabel()){var e=C.selectAll("text."+_).data(t),r=e.enter().append("text").attr("class",function(t,n){return _+" _"+n}).on("click",A)
dc.transition(r,L.transitionDuration()).attr("transform",function(t){t.innerRadius=L.innerRadius(),t.outerRadius=S
var e=n.centroid(t)
return isNaN(e[0])||isNaN(e[1])?"translate(0,0)":"translate("+e+")"}).attr("text-anchor","middle").text(function(t){var n=t.data
return x(n)||v(t)?"":L.label()(t)})}}function s(t,n){l(t,n),d(t,n),f(t)}function l(t,n){var e=C.selectAll("g."+_).data(t).select("path").attr("d",function(t,e){return b(t,e,n)})
dc.transition(e,L.transitionDuration(),function(t){t.attrTween("d",m)}).attr("fill",function(t,n){return L.getColor(t,n)})}function d(t,n){if(L.renderLabel()){var e=C.selectAll("text."+_).data(t)
dc.transition(e,L.transitionDuration()).attr("transform",function(t){t.innerRadius=L.innerRadius(),t.outerRadius=S
var e=n.centroid(t)
return isNaN(e[0])||isNaN(e[1])?"translate(0,0)":"translate("+e+")"}).attr("text-anchor","middle").text(function(t){var n=t.data
return x(n)||v(t)?"":L.label()(t)})}}function f(t){L.renderTitle()&&C.selectAll("g."+_).data(t).select("title").text(function(t){return L.title()(t)})}function g(t){t.exit().remove()}function h(){L.hasFilter()?L.selectAll("g."+_).each(function(t){L.isSelectedSlice(t)?L.highlightSelected(this):L.fadeDeselected(this)}):L.selectAll("g."+_).each(function(){L.resetHighlight(this)})}function p(){return d3.layout.pie().sort(null).value(function(t){return L.valueAccessor()(t)})}function v(t){var n=t.endAngle-t.startAngle
return isNaN(n)||B>n}function x(t){return 0==L.valueAccessor()(t)}function m(t){t.innerRadius=L.innerRadius()
var n=this._current
y(n)&&(n={startAngle:0,endAngle:0})
var e=d3.interpolate(n,t)
return this._current=e(0),function(t){return b(e(t),0,L.buildArcs())}}function y(t){return null==t||isNaN(t.startAngle)||isNaN(t.endAngle)}function A(t){L.onClick(t.data)}function b(t,n,e){var r=e(t,n)
return r.indexOf("NaN")>=0&&(r="M0,0"),r}var C,D=.5,_="pie-slice",S=90,E=0,B=D,L=dc.colorChart(dc.baseChart({})),k=1/0,R="Others",M=function(t,n){t.push({key:R,value:n})}
return L.label(function(t){return L.keyAccessor()(t.data)}),L.renderLabel(!0),L.title(function(t){return L.keyAccessor()(t.data)+": "+L.valueAccessor()(t.data)}),L.transitionDuration(350),L.doRender=function(){return L.resetSvg(),C=L.svg().append("g").attr("transform","translate("+L.cx()+","+L.cy()+")"),r(),L},L.innerRadius=function(t){return arguments.length?(E=t,L):E},L.radius=function(t){return arguments.length?(S=t,L):S},L.cx=function(){return L.width()/2},L.cy=function(){return L.height()/2},L.buildArcs=function(){return d3.svg.arc().outerRadius(S).innerRadius(E)},L.isSelectedSlice=function(t){return L.hasFilter(L.keyAccessor()(t.data))},L.doRedraw=function(){return r(),L},L.minAngleForLabel=function(t){return arguments.length?(B=t,L):B},L.slicesCap=function(t){return arguments.length?(k=t,L):k},L.othersLabel=function(t){return arguments.length?(R=t,L):R},L.othersGrouper=function(t){return arguments.length?(M=t,L):M},L.anchor(t,n)},dc.barChart=function(t,n){function e(t,n){var e=x.getDataWithinXDomain(n)
r(x.x()(x.keyAccessor()(e[0])))
var c=x.chartBodyG().selectAll("rect."+dc.constants.STACK_CLASS+t).data(e)
i(c,t),a(c,t),u(c)}function r(t){if(null==h){var n=x.isOrdinal()?c()+1:c(),e=Math.floor((x.xAxisLength()-t-(n-1)*m)/n);(isNaN(e)||p>e)&&(e=p),h=e}}function i(t,n){var t=t.enter().append("rect")
t.attr("class","bar "+dc.constants.STACK_CLASS+n).attr("x",function(t,e){return l(this,t,n,e)}).attr("y",x.baseLineY()).attr("width",o),x.isOrdinal()&&t.on("click",x.onClick),x.renderTitle()&&t.append("title").text(x.title()),dc.transition(t,x.transitionDuration()).attr("y",function(t,n){return f(this,t,n)}).attr("height",function(t){return x.dataPointHeight(t,d(this))})}function a(t,n){x.renderTitle()&&t.select("title").text(x.title()),dc.transition(t,x.transitionDuration()).attr("x",function(t){return l(this,t,n)}).attr("y",function(t,n){return f(this,t,n)}).attr("height",function(t){return x.dataPointHeight(t,d(this))}).attr("width",o)}function u(t){dc.transition(t.exit(),x.transitionDuration()).attr("y",x.xAxisY()).attr("height",0)}function c(){return null==g&&(g=x.xUnitCount()),g}function o(){return h}function s(t,n){t[dc.constants.GROUP_INDEX_NAME]=n}function l(t,n,e){s(t,e)
var r=x.x()(x.keyAccessor()(n))+x.margins().left
return y&&(r-=o()/2),r}function d(t){return t[dc.constants.GROUP_INDEX_NAME]}function f(t,n,e){var r=d(t)
return x.getChartStack().getDataPoint(r,e)}var g,h,p=1,v=2,x=dc.stackableChart(dc.coordinateGridChart({})),m=v,y=!1
return x.resetBarProperties=function(){g=null,h=null,c(),o()},x.plotData=function(){var t=x.allGroups()
x.calculateDataPointMatrixWithinXDomain(t)
for(var n=0;n<t.length;++n)e(n,t[n])},x.fadeDeselectedArea=function(){var t=x.chartBodyG().selectAll("rect.bar"),n=x.brush().extent()
if(x.isOrdinal())x.hasFilter()?(t.classed(dc.constants.SELECTED_CLASS,function(t){return x.hasFilter(x.keyAccessor()(t))}),t.classed(dc.constants.DESELECTED_CLASS,function(t){return!x.hasFilter(x.keyAccessor()(t))})):(t.classed(dc.constants.SELECTED_CLASS,!1),t.classed(dc.constants.DESELECTED_CLASS,!1))
else if(x.brushIsEmpty(n))t.classed(dc.constants.DESELECTED_CLASS,!1)
else{var e=n[0],r=n[1]
t.classed(dc.constants.DESELECTED_CLASS,function(t){var n=x.keyAccessor()(t)
return e>n||n>=r})}},x.centerBar=function(t){return arguments.length?(y=t,x):y},x.gap=function(t){return arguments.length?(m=t,x):m},x.extendBrush=function(){var t=x.brush().extent()
return x.round()&&!y&&(t[0]=t.map(x.round())[0],t[1]=t.map(x.round())[1],x.chartBodyG().select(".brush").call(x.brush().extent(t))),t},dc.override(x,"prepareOrdinalXAxis",function(){return this._prepareOrdinalXAxis(x.xUnitCount()+1)}),x.anchor(t,n)},dc.lineChart=function(t,n){function e(t,n){var e=r(t),o=i(e,n),s=a(o,e,t)
A&&u(o,e,t,s),y.renderTitle()&&c(o,t)}function r(t){return dc.constants.STACK_CLASS+t}function i(t,n){var e=y.chartBodyG().select("g."+t)
return e.empty()&&(e=y.chartBodyG().append("g").attr("class",t)),e.datum(n.all()),e}function a(t,n,e){var r=t.select("path.line")
r.empty()&&(r=t.append("path").attr("class","line "+n)),r[0][0][dc.constants.GROUP_INDEX_NAME]=e
var i=d3.svg.line().x(C).y(function(t,n){var e=this[dc.constants.GROUP_INDEX_NAME]
return D(t,n,e)})
return dc.transition(r,y.transitionDuration(),function(t){t.ease("linear")}).attr("d",i),i}function u(t,n,e,r){var i=t.select("path.area")
i.empty()&&(i=t.append("path").attr("class","area "+n)),i[0][0][dc.constants.GROUP_INDEX_NAME]=e
var a=d3.svg.area().x(r.x()).y1(r.y()).y0(function(t,n){var e=this[dc.constants.GROUP_INDEX_NAME]
if(0==e)return y.dataPointBaseline()-g
var r=y.getChartStack().getDataPoint(e-1,n)
return r<y.dataPointBaseline()?r-g:r+y.dataPointHeight(t,e-1)})
dc.transition(i,y.transitionDuration(),function(t){t.ease("linear")}).attr("d",a)}function c(t,n){var e=t.select("g."+p)
e.empty()&&(e=t.append("g").attr("class",p)),o(e)
var r=e.selectAll("circle."+v).data(e.datum())
r.enter().append("circle").attr("class",v).attr("r",b).style("fill-opacity",1e-6).style("stroke-opacity",1e-6).on("mousemove",function(){var t=d3.select(this)
s(t),l(t,e)}).on("mouseout",function(){var t=d3.select(this)
d(t),f(e)}).append("title").text(y.title()),r.attr("cx",C).attr("cy",function(t,e){return D(t,e,n)}).select("title").text(y.title()),r.exit().remove()}function o(t){var n=t.select("path."+x).empty()?t.append("path").attr("class",x):t.select("path."+x)
n.style("display","none").attr("stroke-dasharray","5,5")
var e=t.select("path."+m).empty()?t.append("path").attr("class",m):t.select("path."+m)
e.style("display","none").attr("stroke-dasharray","5,5")}function s(t){return t.style("fill-opacity",.8),t.style("stroke-opacity",.8),t}function l(t,n){var e=t.attr("cx"),r=t.attr("cy")
n.select("path."+x).style("display","").attr("d","M"+y.margins().left+" "+r+"L"+e+" "+r),n.select("path."+m).style("display","").attr("d","M"+e+" "+(y.height()-y.margins().bottom)+"L"+e+" "+r)}function d(t){t.style("fill-opacity",1e-6).style("stroke-opacity",1e-6)}function f(t){t.select("path."+x).style("display","none"),t.select("path."+m).style("display","none")}var g=1,h=5,p="dc-tooltip",v="dot",x="yRef",m="xRef",y=dc.stackableChart(dc.coordinateGridChart({})),A=!1,b=h
y.transitionDuration(500),y.plotData=function(){var t=y.allGroups()
y.calculateDataPointMatrixForAll(t)
for(var n=0;n<t.length;++n){var r=t[n]
e(n,r)}}
var C=function(t){return y.margins().left+y.x()(y.keyAccessor()(t))},D=function(t,n,e){var r=y.getChartStack().getDataPoint(e,n)
return r>=y.dataPointBaseline()&&(r+=y.dataPointHeight(t,e)),r}
return y.renderArea=function(t){return arguments.length?(A=t,y):A},y.dotRadius=function(t){return arguments.length?(b=t,y):b},y.anchor(t,n)},dc.dataCount=function(t,n){var e=d3.format(",d"),r=dc.baseChart({})
return r.doRender=function(){return r.selectAll(".total-count").text(e(r.dimension().size())),r.selectAll(".filter-count").text(e(r.group().value())),r},r.doRedraw=function(){return r.doRender()},r.anchor(t,n)},dc.dataTable=function(t,n){function e(){var t=l.root().selectAll("tbody").data(r(),function(t){return l.keyAccessor()(t)}),n=t.enter().append("tbody")
return n.append("tr").attr("class",s).append("td").attr("class",u).attr("colspan",f.length).html(function(t){return l.keyAccessor()(t)}),t.exit().remove(),n}function r(){a||(a=crossfilter.quicksort.by(g))
var t=l.dimension().top(d)
return d3.nest().key(l.group()).sortKeys(h).sortValues(h).entries(a(t,0,t.length))}function i(t){for(var n=t.order().selectAll("tr."+c).data(function(t){return t.values}),e=n.enter().append("tr").attr("class",c),r=0;r<f.length;++r){var i=f[r]
e.append("td").attr("class",o+" _"+r).html(function(t){return i(t)})}return n.exit().remove(),n}var a,u="dc-table-label",c="dc-table-row",o="dc-table-column",s="dc-table-group",l=dc.baseChart({}),d=25,f=[],g=function(t){return t},h=d3.ascending
return l.doRender=function(){return l.selectAll("tbody").remove(),i(e()),l},l.doRedraw=function(){return l.doRender()},l.size=function(t){return arguments.length?(d=t,l):d},l.columns=function(t){return arguments.length?(f=t,l):f},l.sortBy=function(t){return arguments.length?(g=t,l):g},l.order=function(t){return arguments.length?(h=t,l):h},l.anchor(t,n)},dc.bubbleChart=function(t,n){function e(t){var n=t.enter().append("g")
n.attr("class",c.BUBBLE_NODE_CLASS).attr("transform",s).append("circle").attr("class",function(t,n){return c.BUBBLE_CLASS+" _"+n}).on("click",c.onClick).attr("fill",c.initBubbleColor).attr("r",0),dc.transition(t,c.transitionDuration()).attr("r",function(t){return c.bubbleR(t)}).attr("opacity",function(t){return c.bubbleR(t)>0?1:0}),c.doRenderLabel(n),c.doRenderTitles(n)}function r(t){dc.transition(t,c.transitionDuration()).attr("transform",s).selectAll("circle."+c.BUBBLE_CLASS).attr("fill",c.updateBubbleColor).attr("r",function(t){return c.bubbleR(t)}).attr("opacity",function(t){return c.bubbleR(t)>0?1:0}),c.doUpdateLabels(t),c.doUpdateTitles(t)}function i(t){t.exit().remove()}function a(t){var n=c.x()(c.keyAccessor()(t))+c.margins().left
return isNaN(n)&&(n=0),n}function u(t){var n=c.margins().top+c.y()(c.valueAccessor()(t))
return isNaN(n)&&(n=0),n}var c=dc.abstractBubbleChart(dc.coordinateGridChart({})),o=!1
c.transitionDuration(750)
var s=function(t){return"translate("+a(t)+","+u(t)+")"}
return c.elasticRadius=function(t){return arguments.length?(o=t,c):o},c.plotData=function(){o&&c.r().domain([c.rMin(),c.rMax()]),c.r().range([c.MIN_RADIUS,c.xAxisLength()*c.maxBubbleRelativeSize()])
var t=c.chartBodyG().selectAll("g."+c.BUBBLE_NODE_CLASS).data(c.group().all())
e(t),r(t),i(t),c.fadeDeselectedArea()},c.renderBrush=function(){},c.redrawBrush=function(){// override default x axis brush from parent chart
c.fadeDeselectedArea()},c.anchor(t,n)},dc.compositeChart=function(t,n){function e(t,n){t.generateG(o.g()),t.g().attr("class",c+" _"+n)}function r(){for(var t=[],n=0;n<s.length;++n)t.push(s[n].yAxisMin())
return t}function i(){for(var t=[],n=0;n<s.length;++n)t.push(s[n].yAxisMax())
return t}function a(){for(var t=[],n=0;n<s.length;++n)t.push(s[n].xAxisMin())
return t}function u(){for(var t=[],n=0;n<s.length;++n)t.push(s[n].xAxisMax())
return t}var c="sub",o=dc.coordinateGridChart({}),s=[]
return o.transitionDuration(500),dc.override(o,"generateG",function(){for(var t=this._generateG(),n=0;n<s.length;++n){var r=s[n]
e(r,n),null==r.dimension()&&r.dimension(o.dimension()),null==r.group()&&r.group(o.group()),r.chartGroup(o.chartGroup()),r.svg(o.svg()),r.height(o.height()),r.width(o.width()),r.margins(o.margins()),r.xUnits(o.xUnits()),r.transitionDuration(o.transitionDuration())}return t}),o.plotData=function(){for(var t=0;t<s.length;++t){var n=s[t]
null==n.g()&&e(n,t),n.x(o.x()),n.y(o.y()),n.xAxis(o.xAxis()),n.yAxis(o.yAxis()),n.plotData(),n.activateRenderlets()}},o.fadeDeselectedArea=function(){for(var t=0;t<s.length;++t){var n=s[t]
n.brush(o.brush()),n.fadeDeselectedArea()}},o.compose=function(t){return s=t,o},o.children=function(){return s},o.yAxisMin=function(){return d3.min(r())},o.yAxisMax=function(){return dc.utils.add(d3.max(i()),o.yAxisPadding())},o.xAxisMin=function(){return dc.utils.subtract(d3.min(a()),o.xAxisPadding())},o.xAxisMax=function(){return dc.utils.add(d3.max(u()),o.xAxisPadding())},o.anchor(t,n)},dc.geoChoroplethChart=function(t,n){function e(t){var n=dc.utils.groupMax(g.group(),g.valueAccessor()),e=r()
if(i(t)){var u=a(t)
d(u,t,e,n),f(u,t,e)}}function r(){for(var t={},n=g.group().all(),e=0;e<n.length;++e)t[g.keyAccessor()(n[e])]=g.valueAccessor()(n[e])
return t}function i(t){return l(t).keyAccessor}function a(t){var n=g.svg().selectAll(u(t)).classed("selected",function(n){return c(t,n)}).classed("deselected",function(n){return o(t,n)}).attr("class",function(n){var e=l(t).name,r=dc.utils.nameToId(l(t).keyAccessor(n)),i=e+" "+r
return c(t,n)&&(i+=" selected"),o(t,n)&&(i+=" deselected"),i})
return n}function u(t){return"g.layer"+t+" g."+l(t).name}function c(t,n){return g.hasFilter()&&g.hasFilter(s(t,n))}function o(t,n){return g.hasFilter()&&!g.hasFilter(s(t,n))}function s(t,n){return l(t).keyAccessor(n)}function l(t){return p[t]}function d(t,n,e){var r=t.select("path").attr("fill",function(){var t=d3.select(this).attr("fill")
return t?t:"none"}).on("click",function(t){return g.onClick(t,n)})
dc.transition(r,g.transitionDuration()).attr("fill",function(t,r){return g.getColor(e[l(n).keyAccessor(t)],r)})}function f(t,n,e){g.renderTitle()&&t.selectAll("title").text(function(t){var r=s(n,t),i=e[r]
return g.title()({key:r,value:i})})}var g=dc.colorChart(dc.baseChart({}))
g.colorAccessor(function(t){return t})
var h=d3.geo.path(),p=[]
return g.doRender=function(){g.resetSvg()
for(var t=0;t<p.length;++t){var n=g.svg().append("g").attr("class","layer"+t),r=n.selectAll("g."+l(t).name).data(l(t).data).enter().append("g").attr("class",l(t).name)
r.append("path").attr("fill","white").attr("d",h),r.append("title"),e(t)}},g.onClick=function(t,n){var e=l(n).keyAccessor(t)
dc.events.trigger(function(){g.filter(e),dc.redrawAll(g.chartGroup())})},g.doRedraw=function(){for(var t=0;t<p.length;++t)e(t)},g.overlayGeoJson=function(t,n,e){for(var r=0;r<p.length;++r)if(p[r].name==n)return p[r].data=t,p[r].keyAccessor=e,g
return p.push({name:n,data:t,keyAccessor:e}),g},g.projection=function(t){return h.projection(t),g},g.geoJsons=function(){return p},g.removeGeoJson=function(t){for(var n=[],e=0;e<p.length;++e){var r=p[e]
r.name!=t&&n.push(r)}return p=n,g},g.anchor(t,n)},dc.bubbleOverlay=function(t,n){function e(){return c=d.select("g."+o),c.empty()&&(c=d.svg().append("g").attr("class",o)),c}function r(){var t=i()
f.forEach(function(n){var e=a(n,t),r=e.select("circle."+l)
r.empty()&&(r=e.append("circle").attr("class",l).attr("r",0).attr("fill",d.initBubbleColor).on("click",d.onClick)),dc.transition(r,d.transitionDuration()).attr("r",function(t){return d.bubbleR(t)}),d.doRenderLabel(e),d.doRenderTitles(e)})}function i(){var t={}
return d.group().all().forEach(function(n){t[d.keyAccessor()(n)]=n}),t}function a(t,n){var e=s+" "+dc.utils.nameToId(t.name),r=c.select("g."+dc.utils.nameToId(t.name))
return r.empty()&&(r=c.append("g").attr("class",e).attr("transform","translate("+t.x+","+t.y+")")),r.datum(n[t.name]),r}function u(){var t=i()
f.forEach(function(n){var e=a(n,t),r=e.select("circle."+l)
dc.transition(r,d.transitionDuration()).attr("r",function(t){return d.bubbleR(t)}).attr("fill",d.updateBubbleColor),d.doUpdateLabels(e),d.doUpdateTitles(e)})}var c,o="bubble-overlay",s="node",l="bubble",d=dc.abstractBubbleChart(dc.baseChart({})),f=[]
return d.transitionDuration(750),d.radiusValueAccessor(function(t){return t.value}),d.point=function(t,n,e){return f.push({name:t,x:n,y:e}),d},d.doRender=function(){return c=e(),d.r().range([d.MIN_RADIUS,d.width()*d.maxBubbleRelativeSize()]),r(),d.fadeDeselectedArea(),d},d.doRedraw=function(){return u(),d.fadeDeselectedArea(),d},d.debug=function(t){if(t){var n=d.select("g."+dc.constants.DEBUG_GROUP_CLASS)
n.empty()&&(n=d.svg().append("g").attr("class",dc.constants.DEBUG_GROUP_CLASS))
var e=n.append("text").attr("x",10).attr("y",20)
n.append("rect").attr("width",d.width()).attr("height",d.height()).on("mousemove",function(){var t=d3.mouse(n.node()),r=t[0]+", "+t[1]
e.text(r)})}else d.selectAll(".debug").remove()
return d},d.anchor(t,n),d},dc.rowChart=function(t,n){function e(){(!v||x)&&(v=d3.scale.linear().domain([0,d3.max(C.group().all(),C.valueAccessor())]).range([0,C.effectiveWidth()]),D.scale(v))}function r(){var t=p.select("g.axis")
e(),t.empty()&&(t=p.append("g").attr("class","axis").attr("transform","translate(0, "+C.effectiveHeight()+")")),dc.transition(t,C.transitionDuration()).call(D)}function i(){p.selectAll("g.tick").select("line.grid-line").remove(),p.selectAll("g.tick").append("line").attr("class","grid-line").attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",function(){return-C.effectiveHeight()})}function a(){r(),i()
var t=p.selectAll("g."+b).data(C.group().all())
u(t),c(t),o(t)}function u(t){var n=t.enter().append("g").attr("class",function(t,n){return b+" _"+n})
n.append("rect").attr("width",0),l(n),d(t)}function c(t){t.exit().remove()}function o(t){var n=g()
t=t.attr("transform",function(t,e){return"translate(0,"+((e+1)*A+e*n)+")"}).select("rect").attr("height",n).attr("fill",C.getColor).on("click",h).classed("deselected",function(t){return C.hasFilter()?!C.isSelectedRow(t):!1}).classed("selected",function(t){return C.hasFilter()?C.isSelectedRow(t):!1}),dc.transition(t,C.transitionDuration()).attr("width",function(t){return v(C.valueAccessor()(t))}),s(t)}function s(t){C.renderTitle()&&(t.selectAll("title").remove(),t.append("title").text(function(t){return C.title()(t)}))}function l(t){C.renderLabel()&&t.append("text").on("click",h)}function d(t){C.renderLabel()&&t.select("text").attr("x",m).attr("y",y).attr("class",function(t,n){return b+" _"+n}).text(function(t){return C.label()(t)})}function f(){return C.group().all().length}function g(){var t=f()
return(C.effectiveHeight()-(t+1)*A)/t}function h(t){C.onClick(t)}var p,v,x,m=10,y=15,A=5,b="row",C=dc.marginable(dc.colorChart(dc.baseChart({}))),D=d3.svg.axis().orient("bottom")
return C.doRender=function(){return C.resetSvg(),p=C.svg().append("g").attr("transform","translate("+C.margins().left+","+C.margins().top+")"),r(),i(),a(),C},C.title(function(t){return C.keyAccessor()(t)+": "+C.valueAccessor()(t)}),C.label(function(t){return C.keyAccessor()(t)}),C.doRedraw=function(){return a(),C},C.xAxis=function(){return D},C.gap=function(t){return arguments.length?(A=t,C):A},C.elasticX=function(t){return arguments.length?(x=t,C):x},C.labelOffsetX=function(t){return arguments.length?(_labelOffset=t,C):m},C.labelOffsetY=function(t){return arguments.length?(_labelOffset=t,C):y},C.isSelectedRow=function(t){return C.hasFilter(C.keyAccessor()(t))},C.anchor(t,n)}
