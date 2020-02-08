const debug = require('debug')('entitiesGraphWorker')
	, cargo = require('async/cargo')
	, {UndirectedGraph} = require('graphology')
	, louvain = require('graphology-communities-louvain')
	, FA2Layout = require('graphology-layout-forceatlas2')
	, {weightedDegree} = require('graphology-metrics')
	, {subGraph} = require('graphology-utils')

/********************************************************
* entities graph model
* 
*********************************************************/

let self = this

self.graph = self.filteredGraph = new UndirectedGraph()

// temp - read offline graph
//~ const fs = require('fs')
//~ let t = require('./graphExport')
//~ self.graph.import(t)
//~ console.log('graph stats', self.graph.order, self.graph.size)

// temp: log graph size every minut
setInterval(function() {
	console.log('graph stats', self.graph.order, self.graph.size)
}, 60000)


/********************************************************
* 
* Private functions
* 
*********************************************************/


/********************************************************
* 
* Add the entities from new tweets to the graph
* 
* @private
*
*********************************************************/
let add = cargo(function(tweets, callback) {

	debug('integrating new tweets in entities graph', tweets.length)
	
	tweets.forEach( tweet => {
		
		//~console.log('entities', tweet.entities)
		
		//~ console.time('store nodes')
		
		// store nodes
		tweet.entities.forEach(function(entity) {
		
			//~ console.log('entity', entity)
			self.graph.mergeNode(entity, {x: Math.random(), y: Math.random()}) // TODO move coordinates to calls of updateNodeAttribute
			
			self.graph.updateNodeAttribute(entity, 'count', n => (n || 0) + 1)

		})
		
		let extraEntities = tweet.relatedEntities.filter(entity => !tweet.entities.includes(entity))
		
		// add extra entities nodes in case they are not yet present in the graph
		// count is not incremented for these.
		extraEntities.forEach(function(entity) {
		
			self.graph.mergeNode(entity, {x: Math.random(), y: Math.random()})
			
			self.graph.updateNodeAttribute(entity, 'count', n => (n || 0) + 1)
			
		})
		
		//~ console.timeEnd('store nodes')
		
		//~ console.log('edge targets', tweet.relatedEntities)
		
		//~ console.time('store edges')
		//compute and store edges
		tweet.entities.forEach(function(source, i) {
		
			for (var j = i+1; j < tweet.relatedEntities.length; j++) {
				
				let target = tweet.relatedEntities[j]
				
				//~ console.log('saving edge', i, j, source, target)
				
				self.graph.mergeEdge(source, target)
				
				self.graph.updateEdgeAttribute(source, target, 'weight', n => (n || 0) + 1)
				
			}
			
		})
		//~ console.timeEnd('store edges')
		
		//~ console.log('graph stats:')
		//~ console.log('-- nodes count', self.graph.order)
		//~ console.log('-- edges count', self.graph.size)

		
	})
	
	filterGraph()
	
	//~console.log('sending graph')
	process.send(formatGraph())
	
	setTimeout(callback, 10)
})
	
/********************************************************
* Remove entities from obsolete tweets
*
* @private
* 
*********************************************************/
function clean(tweets) {
	
	debug('cleanCache: removing entities from obsolete tweets')
	
	tweets.forEach( tweet => {
	
		tweet.entities.forEach(function(source, i) {
		
			// decrement edge weights and remove obsolete edges
			for (var j = i+1; j < tweet.relatedEntities.length; j++) {
				
				let target = tweet.relatedEntities[j]
				
				 //~console.log('decrement edge', i, j, source, target)
				self.graph.updateEdgeAttribute(source, target, 'weight', n => n - 1)
				
				if (self.graph.getEdgeAttribute(source, target, 'weight') <= 0 ){
					//~console.log('dropped')
					self.graph.dropEdge(source, target)
				}
				
			}
			
			// decrement / remove nodes
			self.graph.updateNodeAttribute(source, 'count', n => n - 1)
			
			if (self.graph.getNodeAttribute(source, 'count') === 0 ){
				self.graph.dropNode(source)
			}
				
		})
			
	})
	
}

/********************************************************
* 
* filter the entities graph in order to return 
* 
*   * only the giant component
*   * only the top ranked entities, and related edges
*
* @private
* 
*********************************************************/	
let filterGraph = function() {
	debug('filterGraph')
	//~console.log('graph', self.graph.toJSON())
	
	if (self.graph.size > 0) {
		
		//~console.time('filterGraph')
		//~ console.time('FA2')
		
		FA2Layout.assign(self.graph, {
		//~ FA2Layout.assign(self.filteredGraph, {
			iterations: 50
			, settings: {
				adjustSizes: true
				, barnesHutOptimize: true
				, gravity: .5
				, strongGravityMode: true
				//~, edgeWeightInfluence: 50
				//~, scalingRatio: 2
			}
		})
		
		//~ console.timeEnd('FA2')
		
		//~ console.time('louvain')
		
		louvain.assign(self.graph)
		
		//~ console.timeEnd('louvain')
		
		//~console.log('node after layout computation', self.filteredGraph.getNodeAttributes(self.filteredGraph.nodes()[0]))
		
		//~ console.time('degree')
		const degrees = weightedDegree(self.graph, {weighted: true})
		//~ console.timeEnd('degree')
		
		// alternative: no filter by degree
		let topNodesKeys = Object.keys(degrees)
		
		//~ console.time('filterByDegree')
		
		//~ let topNodesKeys = Object.keys(degrees).filter(function(key) {
			//~ return degrees[key] > 20
		//~ })
		
		//~ console.timeEnd('filterByDegree')
		
		
		//~ console.time('sortByDegree')
		
		topNodesKeys = topNodesKeys.sort(function(a, b) {
			return degrees[b] - degrees[a]
		}).slice(0, 200)
		//~ console.timeEnd('sortByDegree')
		
		
		//~console.log('topNodesKeys', topNodesKeys)
		
		//~ console.time('subGraph')
		
		self.filteredGraph = subGraph(self.graph, topNodesKeys)
		
		//~ console.timeEnd('subGraph')

		//~console.timeEnd('filterGraph')
		
	}
}

/********************************************************
 *
 * convert graph to d3 format
 *
 * @return {object} graph data in a suitable format for use in d3
 * 
 * @private
 *
 */
function formatGraph() {

	debug('formatGraph')
	
	let res = {
			nodes: []
			, edges: []
		}
	
	self.filteredGraph.forEachNode((node, attributes) => {
		res.nodes.push({
			key: node
			, count: attributes.count
			, x: attributes.x
			, y: attributes.y
			, community: attributes.community
			//~ , weightedDegree: attributes.weightedDegree
		})
	})
	
	self.filteredGraph.forEachEdge(function(edge, attributes, source, target) {
		let sourceIndex = res.nodes.findIndex(function(node, index){
			return node.key === source
		})
		let targetIndex = res.nodes.findIndex(function(node, index){
			return node.key === target
		})
		
		res.edges.push({
			key: source + '-' + target
			, source: sourceIndex
			, target: targetIndex
			, weight: attributes.weight
		})
	})
	
	// get unique communities in order to display legend
	// read also: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#Remove_duplicate_elements_from_the_array
	res.communities = [...new Set(res.nodes.map(d =>d.community))]
	
	//~console.log('formatted graph', res)
	
	return res
	
	
}

/********************************************************
* 
* Public functions
* 
*********************************************************/


process.on('message', function(message) {
	
	switch(message.op) {
		case 'clean':
		console.log('clean', message.data)
			clean(message.data)
			break
		case 'add':
			add.push(message.data, function(err, res) {
				
			})
			break
		default:
			console.error('--------------------------')
			throw new Error('Error: unsupported message' + JSON.stringify(message))
	}
	
})
