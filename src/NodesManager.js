var CascadeNode = require('./nodes/CascadeNode');
var CascadeDataState = require('./nodes/CascadeDataState');
var CascadeDataDerive = require('./nodes/CascadeDataDerive');
var CascadeWait = require('./nodes/CascadeWait');

var util = require('./helper/util');

var Mixin = {
	reinitializeNodesManager : function(){
		this.statesObj = this.statesObj || {};
		this.impactGraph = this.impactGraph || {};
	},
	addNode : function(stateObj){
		if(this.statesObj.hasOwnProperty(stateObj.name)){
			util.error('The state or drived data [' + name + '] is already defined');
		}
		
		var fullDeps = getDeps(stateObj);
		
		ensureDeps(this.statesObj, fullDeps);
		
		this.statesObj[stateObj.name] = stateObj;
		
		addImpactGraph(this.impactGraph, stateObj.name, fullDeps);
	},
	removeNode : function(stateObj){
		if(stateObj && stateObj instanceof CascadeWait){
			var that = this;
			util.arrayForEach(stateObj.deps, function(depName){
				var edges = that.impactGraph[depName];
				edges.splice(util.arrayIndexOf(edges, stateObj.name), 1);
			});
			
			delete this.statesObj[stateObj.name];
		}else{
			util.error('You can only remove CascadeWait object');
		}
	},
	removeInitialDeps : function(stateObj){
		if(stateObj instanceof CascadeDataState){
			var initialDeps = stateObj.initialDeps;
			var depsToRemove = [];
			util.arrayForEach(initialDeps, function(depName){
				if(util.arrayIndexOf(stateObj.deps, depName) === -1){
					depsToRemove.push(depName);
				}
			});
			delete stateObj.initialDeps;
			delete stateObj.initialFactory;
			
			var that = this;
			util.arrayForEach(depsToRemove, function(depName){
				var edges = that.impactGraph[depName];
				edges.splice(util.arrayIndexOf(edges, stateObj.name), 1);
			});
		}else{
			util.error('You can only remove initialDeps of a CascadeDataState object');
		}
	},
	//deep first
	getChildren : function(name){
		var that = this;
		var list = [].concat(this.impactGraph[name] || []);
		util.arrayForEach(list, function(nodeName){
			util.arrayForEach(that.getChildren(nodeName), function(name){
				if(util.arrayIndexOf(list, name) === -1){
					list.push(name);
				}
			});
		});
		
		return list;
	}
};

//updating impactGraph when adding stateObj
function addImpactGraph(impactGraph, name, fullDeps){
	util.arrayForEach(fullDeps, function(depName){
		var edges = impactGraph[depName] = impactGraph[depName] || [];
		edges.push(name);
	});
}

//ensure valid deps
function ensureDeps(statesObj, deps){
	//check dependencies
	util.arrayForEach(deps, function(depName){
		if(!statesObj.hasOwnProperty(depName)){
			util.error('The dependency [' + depName + '] does not exist');
		}
	});
}

//get the deps+initialDeps of a node
function getDeps(stateObj){
	var deps = stateObj.deps;
		
	if(stateObj instanceof CascadeDataState && stateObj.initialDeps){
		util.arrayForEach(stateObj.initialDeps, function(depName){
			if(util.arrayIndexOf(deps, depName) === -1){
				deps.push(depName);
			}
		});
	}
	
	return deps;
}

module.exports = {
	Mixin : Mixin
}
