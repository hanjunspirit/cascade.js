/**
 * @preserve Cascade.js
 *
 * @version 1.1.0
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license https://github.com/hanjunspirit/cascade.js/blob/master/LICENSE
 */
'use strict';

var Transaction = require('./helper/Transaction');
var UglyPromise = require('./helper/UglyPromise');
var util = require('./helper/util');

var CascadeNode = require('./nodes/CascadeNode');
var CascadeDataState = require('./nodes/CascadeDataState');
var CascadeDataDerive = require('./nodes/CascadeDataDerive');
var CascadeWait = require('./nodes/CascadeWait');

var NodesManager = require('./NodesManager');

//Cascade Class
function Cascade(){
	this.states = {};
	
	this._waitIdx = 0;
	
	this.subscribers = [];
	
	this.reinitializeTransaction();
	this.reinitializeNodesManager();
}

util.assign(Cascade.prototype, Transaction.Mixin, NodesManager.Mixin, {
	//define state
	define : function(name, deps, factory, initialDeps, initialFactory){
		this.addNode(new CascadeDataState(name, deps, factory, initialDeps, initialFactory));
		this.batchedUpdate(function(){
			this.adjust(name);
			this.updatedStates[name] = this.getState(name);
		});
	},
	
	//define derived data
	derive : function(name, deps, factory){
		this.addNode(new CascadeDataDerive(name, deps, factory));
		this.batchedUpdate(function(){
			this.adjust(name);
			this.updatedStates[name] = this.getState(name);
		});
	},
	
	wait : function(deps, factory){
		var name = '__wait__' + this._waitIdx++;
		this.addNode(new CascadeWait(name, deps, factory));
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
	
	getStates : function(){
		var states = {};
		for(var name in this.statesObj){
			var obj = this.statesObj[name];
			if(obj instanceof CascadeWait){
				continue;
			}
			states[name] = obj.isClean() ? this.states[name] : null;
		}
		return states;
	},
	
	getState : function(name){
		var stateObj = this.statesObj[name];
		if(stateObj && stateObj.isClean() && !(stateObj instanceof CascadeWait)){
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
			util.error('You can not set a derived data!');
		}
		
		if(stateObj.isPending()){
			util.warning('You can\'t set a pending state!');
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
		util.arrayForEach(dirtyChildren, function(name){
			//From clean/pending to dirty
			that.statesObj[name].setDirty();
		})
		
		util.arrayForEach(dirtyChildren, function(name){
			that.adjust(name);
			if(that.statesObj[name] && !(that.statesObj[name] instanceof CascadeWait)){
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
			util.error('adjust calls must be in Transaction');
			return;
		}
		
		var deps = stateObj.deps;
		
		//If there is an initialFactory, wait for initialDeps
		if(stateObj instanceof CascadeDataState && stateObj.hasOwnProperty('initialFactory')){
			deps = deps.concat(stateObj.initialDeps);
		}
		
		var that = this;
		var isPending = util.arraySome(deps, function(name){
			that.adjust(name);
			return that.statesObj[name].isPending();
		});
		
		if(isPending){
			//From dirty to pending
			stateObj.setPending();
		}else if(stateObj instanceof CascadeDataState){
			//Get deps first
			var depsValue = util.arrayMap(stateObj.deps, function(name){
				return that.states[name];
			});
			
			//compute definition field
			var definition = stateObj.definition = typeof stateObj.factory !== 'function' ? Cascade.types.Fixed(stateObj.factory) : stateObj.factory.apply(null, depsValue);
			
			if(!(definition instanceof DataType)){
				util.error('Invalid definition was returned in state [' + name + ']');
			}
			
			//For uninitialized state with an initialFactory, compute its initial value
			if(stateObj.hasOwnProperty("initialFactory")){
				if(typeof stateObj.initialFactory === "function"){
					//Get initialDeps first
					var initialDepsValue = util.arrayMap(stateObj.initialDeps, function(name){
						return that.states[name];
					});
					
					var newValue = stateObj.initialFactory.apply(null, initialDepsValue);
				}else{
					var newValue = stateObj.initialFactory;
				}
				
				this.states[name] = definition.setter(newValue);
				
				this.removeInitialDeps(name);
			}else{
				//For uninitialized state without an initialFactory or initialized value
				this.states[name] = definition.setter(this.states[name]);
			}
			
			//From dirty to clean
			stateObj.setClean();
		}else if(stateObj instanceof CascadeDataDerive){
			
			//Get deps first
			var depsValue = util.arrayMap(stateObj.deps, function(name){
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
		}else if(stateObj instanceof CascadeWait){
			if(typeof stateObj.factory === 'function'){
				this.waitToExecs.push(function(){
					//Get deps first
					var depsValue = util.arrayMap(stateObj.deps, function(name){
						return that.states[name];
					});
					stateObj.factory.apply(null, depsValue);
				});
			}
			this.removeNode(name);
		}
	},
	
	batchedUpdate : function(callback){
		if(this._isInTransaction){
			callback.call(this);
		}else{
			this.perform(callback, this);
		}
	},
	
	subscribe : function(fn){
		if(util.arrayIndexOf(this.subscribers, fn) === -1){
			this.subscribers.push(fn);
		}
	},
	
	unsubscribe : function(fn){
		var index = util.arrayIndexOf(this.subscribers, fn);
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
			util.arrayForEach(this.subscribers, function(subscriber){
				subscriber(that.updatedStates);
			});
		}
		this.updatedStates = {};
	}
};

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
	
	util.extendClass(extendedDataType, DataType);
	
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
	if(util.arrayIndexOf(enumList, valueToSet) !== -1){
		return valueToSet;
	}else if(oldValue !== undefined){
		return oldValue;
	}else{
		return enumList[0];
	}
});

Cascade.async = function(callback){
	return new UglyPromise(callback);
};

function isPromise(obj){
	return obj instanceof UglyPromise;
};

module.exports = Cascade;