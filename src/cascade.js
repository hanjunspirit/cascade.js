/**
 * Cascade.js 1.0.0 | https://github.com/hanjunspirit/cascade.js/blob/master/LICENSE
 */
'use strict';
class CascadeDataState {
	constructor(name, deps, factory){
		this.name = name;
		this.deps = deps;
		this.factory = factory;
		
		this.definition = null;
		this.status = STATUS.UNINITIALIZED;
	}
	
	setDirty(){
		if(this.status === STATUS.CLEAN){
			this.status = STATUS.DIRTY;
		}
	}
}

var STATUS = CascadeDataState.STATUS = {
	UNINITIALIZED : 0,
	DIRTY : 1,
	CLEAN : 2
};

class CascadeDataDerive {
	constructor(name, deps, factory){
		this.name = name;
		this.deps = deps;
		this.factory = factory;
		
		this.status = STATUS.UNINITIALIZED;
	}
	
	setDirty(){
		if(this.status === STATUS.CLEAN){
			this.status = STATUS.DIRTY;
		}
	}
}

class Cascade {
	constructor(){
		this.statesObj = {};
		this.states = {};
	}
	
	//define state
	define(name, deps, factory){
		deps = deps || [];
		
		if(this.statesObj[name]){
			throw new Error('State ${name} is already defined');
		}
		
		//check dependencies
		deps.forEach(depName => {
			if(!this.statesObj.hasOwnProperty(depName)){
				throw new Error(`The dependency [${depName}] does not exist in defining [${name}]`);
			}
		});
		this.statesObj[name] = new CascadeDataState(name, deps, factory);
		this.adjust(name);
	}
	
	//define derived data
	derive(name, deps, factory){
		deps = deps || [];
		
		if(this.statesObj[name]){
			throw new Error('Derived data ${name} is already defined');
		}
		
		//check dependencies
		deps.forEach(depName => {
			if(!this.statesObj.hasOwnProperty(depName)){
				throw new Error(`The dependency [${depName}] does not exist in defining [${name}]`);
			}
		});
		
		this.statesObj[name] = new CascadeDataDerive(name, deps, factory);
		this.adjust(name);
	}
	
	getStates(){
		return this.states;
	}
	
	getState(name){
		return this.states[name];
	}
	
	getDefinition(name){
		return this.statesObj[name].definition;
	}
	
	setState(name, value){
		var stateObj = this.statesObj[name];
		if(!stateObj){
			return;
		}
		
		if(stateObj instanceof CascadeDataDerive){
			throw new Error('You can not set a derived data!');
		}
		
		var isDirty = false;
		var definition = stateObj.definition;
		
		var oldValue = this.states[name];
		
		this.states[name] = typesSetter[definition.type].apply(window, [value, oldValue].concat(definition.range));
		
		if(oldValue !== this.states[name]){
			isDirty = true;
		}
		
		if(isDirty){
			var dirtyChildren = this.getChildren(name);
			dirtyChildren.forEach(name => {
				this.statesObj[name].setDirty();
			});
			
			dirtyChildren.forEach(name => {
				this.adjust(name);
			});
		}
	}
	
	adjust(name){
		var stateObj = this.statesObj[name];
		
		if(stateObj.status === STATUS.CLEAN){
			return;
		}
		
		if(stateObj instanceof CascadeDataState){
			
			//adjust deps first
			var depsValue = stateObj.deps.map(name => {
				this.adjust(name);
				return this.states[name];
			});
			
			//compute definition field
			var definition = stateObj.definition = typeof stateObj.factory !== 'function' ? Cascade.types.Fixed(stateObj.factory) : stateObj.factory.apply(window, depsValue);
			
			if(!definition){
				throw new Error(`Empty definition in state ${name}`);
			}
			
			if(!typesAdapter[definition.type]){
				throw new Error(`Invalid definition in state ${name}`);
			}
			
			//adjust value
			//for uninitialized state, the initial value comes from definition
			//for dirty state, the current value is this.states[stateObj.name]
			var currentValue = stateObj.status === STATUS.UNINITIALIZED ? undefined : this.states[stateObj.name];
			
			this.states[name] = typesAdapter[definition.type].apply(window, [currentValue].concat(definition.range));
			
			stateObj.status = STATUS.CLEAN;
		}else if(stateObj instanceof CascadeDataDerive){
			//adjust deps first
			var depsValue = stateObj.deps.map(name => {
				this.adjust(name);
				return this.states[name];
			});
			
			this.states[name] = stateObj.factory.apply(window, depsValue);
			stateObj.status = STATUS.CLEAN;
		}
	}
	
	getChildren(name, list){
		list = list || [];
		var stateObj = this.statesObj[name];
		
		for(var _name in this.statesObj){
			var _stateObj = this.statesObj[_name];
			if(list.indexOf(_name) === -1 && _stateObj.deps.indexOf(name) !== -1){
				list.push(_name);
				this.getChildren(_name, list);
			}
		}
		return list;
	}
}

Cascade.CascadeDataState = CascadeDataState;
Cascade.CascadeDataDerive = CascadeDataDerive;

var _cid = 1;

var TYPES = {
    Fixed : 0
};

Cascade.types = {};
var typesAdapter = {};
var typesSetter = {};

Cascade.extendDataType = function(name, adapter, setter){
	var id = TYPES[name] = _cid++;
	
	typesAdapter[id] = adapter;
	
	typesSetter[id] = setter;
	
	Cascade.types[name] = function(){
		return {
			type : TYPES[name],
			range : Array.prototype.slice.apply(arguments)
		}
	}
}

Cascade.extendDataType('Fixed', (currentValue, theOnlyValue) => {
	return theOnlyValue;
}, (newValue, oldValue, theOnlyValue) => {
	return theOnlyValue;
});

Cascade.extendDataType('Enum', (currentValue, range) => {
	if(!Array.isArray(range) || !(range.length > 0)){
		throw new Error('Invald definition for Enum value');
	}
	
	if(range.indexOf(currentValue) !== -1){
		return currentValue;
	}
	return range[0];
}, (newValue, oldValue, range) => {
	if(range.indexOf(newValue) !== -1){
		return newValue;
	}else if(range.indexOf(oldValue) !== -1){
		return oldValue;
	}else{
		return range[0];
	}
});

module.exports = Cascade;