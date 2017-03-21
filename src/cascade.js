/**
 * @preserve Cascade.js
 *
 * @version 1.1.0
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license https://github.com/hanjunspirit/cascade.js/blob/master/LICENSE
 */
'use strict';

var Transaction = require('./Transaction');

function CascadeNode(name, deps) {
	this.name = name;
	this.deps = deps;
	this.status = STATUS.DIRTY;
}

CascadeNode.prototype = {
	setDirty : function(){
		this.status = STATUS.DIRTY;
	},
	setPending : function(){
		if(this.status === STATUS.DIRTY){
			this.status = STATUS.PENDING;
		}
	},
	setClean : function(){
		if(this.status === STATUS.DIRTY){
			this.status = STATUS.CLEAN;
		}
	},
	isClean : function(){
		return this.status === STATUS.CLEAN;
	},
	isPending : function(){
		return this.status === STATUS.PENDING;
	},
	isDirty : function(){
		return this.status === STATUS.DIRTY;
	}
}

var STATUS = {
	DIRTY : 1,
	CLEAN : 2,
	PENDING : 3
};

//State Class
function CascadeDataState(name, deps, factory, initialDeps, initialFactory){
	CascadeNode.call(this, name, deps);
	if(!name){
		error('Invalid name in defining state');
	}
	if(factory === undefined){
		error('Invalid factory in defining state');
	}
	this.factory = factory;
	
	if(initialFactory !== undefined){
		this.initialDeps = initialDeps || [];
		this.initialFactory = initialFactory;
	}
	
	this.definition = null;
}
_assign(CascadeDataState.prototype, CascadeNode.prototype);

//Derived data Class
function CascadeDataDerive(name, deps, factory){
	CascadeNode.call(this, name, deps);
	if(!name){
		error('Invalid name in defining derived data');
	}
	
	if(typeof factory !== "function"){
		error('Invalid factory in defining derived data ' + name);
	}
	
	this.name = name;
	this.deps = deps;
	this.factory = factory;
	
	this.status = STATUS.DIRTY;
}
_assign(CascadeDataDerive.prototype, CascadeNode.prototype);

//cascadeObj.wait Class
function CascadeRequire(name, deps, factory){
	CascadeNode.call(this, name, deps);
	this.factory = factory;
}
_assign(CascadeRequire.prototype, CascadeNode.prototype);

//Cascade Class
function Cascade(){
	this.statesObj = {};
	this.states = {};
	
	this._requireIdx = 0;
	
	this.subscribers = [];
	
	this.reinitializeTransaction();
	
	this.impactGraph = {};
}

_assign(Cascade.prototype, Transaction.Mixin, {
	//define state
	define : function(name, deps, factory, initialDeps, initialFactory){
		deps = deps || [];
		initialDeps = initialDeps;
		
		if(this.statesObj[name]){
			error('State ${name} is already defined');
		}
		
		this._checkDeps(deps);
		
		this.statesObj[name] = new CascadeDataState(name, deps, factory, initialDeps, initialFactory);
		this._updateImpactGraph(this.statesObj[name]);
		this.batchedUpdate(function(){
			this.adjust(name);
			this.updatedStates[name] = this.getState(name);
		});
	},
	
	//define derived data
	derive : function(name, deps, factory){
		deps = deps || [];
		
		if(this.statesObj[name]){
			error('Derived data ${name} is already defined');
		}
		
		this._checkDeps(deps);
		
		this.statesObj[name] = new CascadeDataDerive(name, deps, factory);
		this._updateImpactGraph(this.statesObj[name]);
		this.batchedUpdate(function(){
			this.adjust(name);
			this.updatedStates[name] = this.getState(name);
		});
	},
	
	wait : function(deps, factory){
		deps = deps || [];
		this._checkDeps(deps);
		
		var name = '__require__' + this._requireIdx++;
		this.statesObj[name] = new CascadeRequire(name, deps, factory);
		this._updateImpactGraph(this.statesObj[name]);
		this.batchedUpdate(function(){
			this.adjust(name);
		});
	},
	
	forceUpdate : function(name){
		var stateObj = this.statesObj[name];
		
		if(!stateObj || !stateObj.isClean()){
			return;
		}
		
		stateObj.setDirty();
		
		this.batchedUpdate(function(){
			this.adjust(name);
		});
	},
	
	_checkDeps : function(deps){
		var that = this;
		//check dependencies
		arrayForEach(deps, function(depName){
			if(!that.statesObj.hasOwnProperty(depName)){
				error('The dependency [' + depName + '] does not exist');
			}
		});
	},
	
	_updateImpactGraph : function(stateObj){
		var deps = (stateObj.deps || []).concat(stateObj.initialDeps || []);
		var that = this;
		arrayForEach(deps, function(nodeName){
			var edges = that.impactGraph[nodeName] = that.impactGraph[nodeName] || [];
			edges.push(stateObj.name);
		});
	},
	
	_removeInitialDeps : function(stateObj){
		var initialDeps = stateObj.initialDeps;
		delete stateObj.initialDeps;
		delete stateObj.initialFactory;
		var that = this;
		arrayForEach(initialDeps, function(nodeName){
			var edges = that.impactGraph[nodeName];
			edges.splice(arrayIndexOf(edges, stateObj.name), 1);
		});
	},
	
	_removeWaitNode : function(stateObj){
		if(stateObj && stateObj instanceof CascadeRequire){
			var that = this;
			arrayForEach(stateObj.deps, function(nodeName){
				var edges = that.impactGraph[nodeName];
				edges.splice(arrayIndexOf(edges, stateObj.name), 1);
			});
			
			delete this.statesObj[stateObj.name];
		}
	},
	
	getStates : function(){
		var states = {};
		for(var name in this.statesObj){
			var obj = this.statesObj[name];
			if(obj instanceof CascadeRequire){
				continue;
			}
			states[name] = obj.isClean() ? this.states[name] : null;
		}
		return states;
	},
	
	getState : function(name){
		var stateObj = this.statesObj[name];
		if(stateObj && stateObj.isClean() && !(stateObj instanceof CascadeRequire)){
			return this.states[name];
		}else{
			return null;
		}
	},
	
	setState : function(name, value){
		var stateObj = this.statesObj[name];
		if(!stateObj){
			return;
		}
		
		if(stateObj instanceof CascadeDataDerive){
			error('You can not set a derived data!');
		}
		
		if(stateObj.isPending()){
			warning('You can\'t set a pending state!');
			return;
		}
		
		var definition = stateObj.definition;
		
		var oldValue = this.states[name];
		
		this.states[name] = definition.setter(value, oldValue);
		
		this.batchedUpdate(function(){
			if(oldValue !== this.states[name]){
				//Record updated states
				this.updatedStates[name] = this.states[name];
				//From clean to dirty, Then dirty to clean
				this._adjustChildren(name);
			}
		}, this);
	},
	
	_adjustChildren : function(name){
		var dirtyChildren = this.getChildren(name);
		var that = this;
		arrayForEach(dirtyChildren, function(name){
			//From clean/pending to dirty
			that.statesObj[name].setDirty();
		})
		
		arrayForEach(dirtyChildren, function(name){
			that.adjust(name);
			if(that.statesObj[name] && !(that.statesObj[name] instanceof CascadeRequire)){
				//Record updated states
				that.updatedStates[name] = that.getState(name);
			}
		});
	},
	
	adjust : function(name){
		var stateObj = this.statesObj[name];
		
		if(!stateObj.isDirty()){
			return;
		}
		
		if(!this._isInTransaction){
			error('adjust calls must be in Transaction');
			return;
		}
		
		var deps = stateObj.deps;
		
		//If there is an initialFactory, wait for initialDeps
		if(stateObj instanceof CascadeDataState && stateObj.hasOwnProperty('initialFactory')){
			deps = deps.concat(stateObj.initialDeps);
		}
		
		var that = this;
		var isPending = arraySome(deps, function(name){
			that.adjust(name);
			return that.statesObj[name].isPending();
		});
		
		if(isPending){
			//From dirty to pending
			stateObj.setPending();
		}else if(stateObj instanceof CascadeDataState){
			//Get deps first
			var depsValue = arrayMap(stateObj.deps, function(name){
				return that.states[name];
			});
			
			//compute definition field
			var definition = stateObj.definition = typeof stateObj.factory !== 'function' ? Cascade.types.Fixed(stateObj.factory) : stateObj.factory.apply(null, depsValue);
			
			if(!(definition instanceof DataType)){
				error('Empty definition in state' + name);
			}
			
			//For uninitialized state with an initialFactory, compute its initial value
			if("initialFactory" in stateObj){
				if(typeof stateObj.initialFactory === "function"){
					//Get initialDeps first
					var initialDepsValue = arrayMap(stateObj.initialDeps, function(name){
						return that.states[name];
					});
					
					var newValue = stateObj.initialFactory.apply(null, initialDepsValue);
				}else{
					var newValue = stateObj.initialFactory;
				}
				
				this.states[name] = definition.setter(newValue);
				
				this._removeInitialDeps(stateObj);
			}else{
				//For uninitialized state without an initialFactory or initialized value
				this.states[name] = definition.setter(this.states[name]);
			}
			
			//From dirty to clean
			stateObj.setClean();
		}else if(stateObj instanceof CascadeDataDerive){
			
			//Get deps first
			var depsValue = arrayMap(stateObj.deps, function(name){
				return that.states[name];
			});
			
			var stateValue = this.states[name] = stateObj.factory.apply(null, depsValue);
			//Handle Promise value
			if(isPromise(stateValue)){
				var onThen = function(resolvedValue){
					//When Promise is resolved, setState its resolved value
					if(stateValue === that.states[name]){
						that.batchedUpdate(function(){
							this.states[name] = resolvedValue;
							
							//Record updated states
							this.updatedStates[name] = this.states[name];
							
							//From pending to dirty
							stateObj.setDirty();
							//From dirty to clean
							stateObj.setClean();
							
							//From pending to dirty, Then dirty to clean
							this._adjustChildren(name);
						});
					}
				};
				
				stateValue.then(function(resolvedValue){
					return onThen(resolvedValue)
				}, function(){
					return onThen(null);
				});
				//From dirty to pending
				stateObj.setPending();
			}else{
				//From dirty to clean
				stateObj.setClean();
			}
		}else if(stateObj instanceof CascadeRequire){
			if(typeof stateObj.factory === 'function'){
				this.waitToExecs.push(function(){
					//Get deps first
					var depsValue = arrayMap(stateObj.deps, function(name){
						return that.states[name];
					});
					stateObj.factory.apply(null, depsValue);
				});
			}
			this._removeWaitNode(this.statesObj[name]);
		}
	},
	
	//deep first
	getChildren : function(name){
		var that = this;
		var list = [].concat(this.impactGraph[name] || []);
		arrayForEach(list, function(nodeName){
			arrayForEach(that.getChildren(nodeName), function(name){
				if(arrayIndexOf(list, name) === -1){
					list.push(name);
				}
			});
		});
		
		return list;
	},
	
	batchedUpdate : function(callback){
		if(this._isInTransaction){
			callback.call(this);
		}else{
			this.perform(callback, this);
		}
	},
	
	subscribe : function(fn){
		if(arrayIndexOf(this.subscribers, fn) === -1){
			this.subscribers.push(fn);
		}
	},
	
	unsubscribe : function(fn){
		var index = arrayIndexOf(this.subscribers, fn);
		if(index !== -1){
			this.subscribers.splice(index, 1);
		}
	},
	
	getTransactionWrappers : function(){
		return [EXEC_WAIT_WRAPPER, NOTIFY_SUBSCRIBERS_WRAPPER];
	}
});

var EXEC_WAIT_WRAPPER = {
	initialize : function(){
		this.waitToExecs = [];
	},
	close : function(){
		var callback;
		while(callback = this.waitToExecs.shift()){
			callback();
		}
	}
};

var NOTIFY_SUBSCRIBERS_WRAPPER = {
	initialize : function(){
		this.updatedStates = {};
	},
	close : function(){
		var keys = 0;
		for(var i in this.updatedStates){
			keys++;
		}
		if(keys > 0){
			var that = this;
			//excute the subscribers
			arrayForEach(this.subscribers, function(subscriber){
				subscriber(that.updatedStates);
			});
		}
		this.updatedStates = {};
	}
};

function warning(tips){
	typeof console !== 'undefined' && console.warn(tips);
}

function error(tips){
	typeof console !== 'undefined' && console.error(tips);
	throw new Error(tips);
}

function arrayForEach(arr, callback){
	for(var i in arr){
		callback(arr[i], i);
	}
}
function arraySome(arr, callback){
	for(var i in arr){
		if(callback(arr[i], i)){
			return true;
		}
	}
	return false;
}
function arrayMap(arr, callback){
	var res = [];
	arrayForEach(arr, function(value, key){
		res.push(callback(value, key));
	});
	return res;
}
function arrayIndexOf(arr, toFind){
	var idx = -1;
	for(var i = 0; i < arr.length; i++){
		if(arr[i] === toFind){
			return i;
		}
	}
	return idx;
}


function _assign(base){
	var list = Array.prototype.slice.call(arguments, 1);
	arrayForEach(list, function(obj){
		for(var i in obj){
			if(obj.hasOwnProperty(i)){
				base[i] = obj[i];
			}
		}
	});
}

function extendClass(Class, Super){
	var E = function () {};
	E.prototype = Super.prototype;
	var prototype = new E();

	_assign(prototype, Class.prototype);
	Class.prototype = prototype;
	Class.prototype.constructor = Class;
}

function DataType(){}

Cascade.extendDataType = function(onSetValue){
	function extendedDataType(args){
		this.args = args;
	}
	
	extendedDataType.prototype = {
		setter : function(newValue, oldValue){
			return onSetValue.apply(null, [newValue, oldValue].concat(this.args))
		}
	}
	
	extendClass(extendedDataType, DataType);
	
	return function(){
		return new extendedDataType(Array.prototype.slice.call(arguments));
	}
}

//Some built in types
Cascade.types = {};

/**
 * Read only value
 */
Cascade.types.Fixed = Cascade.extendDataType(function(valueToSet, oldValue, theOnlyValue){
	return theOnlyValue;
});

/**
 * Read/Write value
 */
Cascade.types.Any = Cascade.extendDataType(function(valueToSet, oldValue){
	return valueToSet;
});

/**
 * Enum value
 */
Cascade.types.Enum = Cascade.extendDataType(function(valueToSet, oldValue, enumList){
	if(arrayIndexOf(enumList, valueToSet) !== -1){
		return valueToSet;
	}else if(oldValue !== undefined){
		return oldValue;
	}else{
		return enumList[0];
	}
});

function uglyPromise(callback){
	this.status = 'Pending';
	this.onResolveCallback = [];
	
	var that = this;
	function onResolve(resolvedValue){
		that.status = 'Resolved';
		for(var i = 0; i < that.onResolveCallback.length; i++){
			that.onResolveCallback[i](resolvedValue);
		}
		that.onResolveCallback[i] = [];
	}
	
	callback(onResolve);
}
uglyPromise.prototype.then = function(onResolve){
	if(this.status === 'Pending'){
		if(onResolve){
			this.onResolveCallback.push(onResolve);
		}
	}else{
		if(onResolve){
			onResolve();
		}
	}
}

Cascade.async = function(callback){
	return new uglyPromise(callback);
};

var isPromise = function(obj){
	return obj instanceof uglyPromise;
};

module.exports = Cascade;