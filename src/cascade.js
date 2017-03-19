/**
 * Cascade.js 1.0.3 | https://github.com/hanjunspirit/cascade.js/blob/master/LICENSE
 */
'use strict';

var Promise = require('promise');

/**
 * `Transaction` creates a black box that is able to wrap any method such that
 * certain invariants are maintained before and after the method is invoked
 * (Even if an exception is thrown while invoking the wrapped method). Whoever
 * instantiates a transaction can provide enforcers of the invariants at
 * creation time. The `Transaction` class itself will supply one additional
 * automatic invariant for you - the invariant that any transaction instance
 * should not be run while it is already being run. You would typically create a
 * single instance of a `Transaction` for reuse multiple times, that potentially
 * is used to wrap several different methods. Wrappers are extremely simple -
 * they only require implementing two methods.
 *
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 * Use cases:
 * - Preserving the input selection ranges before/after reconciliation.
 *   Restoring selection even in the event of an unexpected error.
 * - Deactivating events while rearranging the DOM, preventing blurs/focuses,
 *   while guaranteeing that afterwards, the event system is reactivated.
 * - Flushing a queue of collected DOM mutations to the main UI thread after a
 *   reconciliation takes place in a worker thread.
 * - Invoking any collected `componentDidUpdate` callbacks after rendering new
 *   content.
 * - (Future use case): Wrapping particular flushes of the `ReactWorker` queue
 *   to preserve the `scrollTop` (an automatic scroll aware DOM).
 * - (Future use case): Layout calculations before and after DOM updates.
 *
 * Transactional plugin API:
 * - A module that has an `initialize` method that returns any precomputation.
 * - and a `close` method that accepts the precomputation. `close` is invoked
 *   when the wrapped process is completed, or has failed.
 *
 * @param {Array<TransactionalWrapper>} transactionWrapper Wrapper modules
 * that implement `initialize` and `close`.
 * @return {Transaction} Single transaction for reuse in thread.
 *
 * @class Transaction
 */
class Transaction {
  constructor(){}
  /**
   * Sets up this instance so that it is prepared for collecting metrics. Does
   * so such that this setup method may be used on an instance that is already
   * initialized, in a way that does not consume additional memory upon reuse.
   * That can be useful if you decide to make your subclass of this mixin a
   * "PooledClass".
   */
  reinitializeTransaction() {
    this.transactionWrappers = this.getTransactionWrappers();
    if (this.wrapperInitData) {
      this.wrapperInitData.length = 0;
    } else {
      this.wrapperInitData = [];
    }
    this._isInTransaction = false;
  }

  /**
   * @abstract
   * @return {Array<TransactionWrapper>} Array of transaction wrappers.
   */
  getTransactionWrappers(){
  	return null;
  }

  isInTransaction() {
    return !!this._isInTransaction;
  }

  /**
   * Executes the function within a safety window. Use this for the top level
   * methods that result in large amounts of computation/mutations that would
   * need to be safety checked. The optional arguments helps prevent the need
   * to bind in many cases.
   *
   * @param {function} method Member of scope to call.
   * @param {Object} scope Scope to invoke from.
   * @param {Object?=} a Argument to pass to the method.
   * @param {Object?=} b Argument to pass to the method.
   * @param {Object?=} c Argument to pass to the method.
   * @param {Object?=} d Argument to pass to the method.
   * @param {Object?=} e Argument to pass to the method.
   * @param {Object?=} f Argument to pass to the method.
   *
   * @return {*} Return value from `method`.
   */
  perform(method, scope, a, b, c, d, e, f) {
    var errorThrown;
    var ret;
    try {
      this._isInTransaction = true;
      // Catching errors makes debugging more difficult, so we start with
      // errorThrown set to true before setting it to false after calling
      // close -- if it's still set to true in the finally block, it means
      // one of these calls threw.
      errorThrown = true;
      this.initializeAll(0);
      ret = method.call(scope, a, b, c, d, e, f);
      errorThrown = false;
    } finally {
      try {
        if (errorThrown) {
          // If `method` throws, prefer to show that stack trace over any thrown
          // by invoking `closeAll`.
          try {
            this.closeAll(0);
          } catch (err) {
          }
        } else {
          // Since `method` didn't throw, we don't want to silence the exception
          // here.
          this.closeAll(0);
        }
      } finally {
        this._isInTransaction = false;
      }
    }
    return ret;
  }

  initializeAll(startIndex) {
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      try {
        // Catching errors makes debugging more difficult, so we start with the
        // OBSERVED_ERROR state before overwriting it with the real return value
        // of initialize -- if it's still set to OBSERVED_ERROR in the finally
        // block, it means wrapper.initialize threw.
        this.wrapperInitData[i] = Transaction.OBSERVED_ERROR;
        this.wrapperInitData[i] = wrapper.initialize ?
          wrapper.initialize.call(this) :
          null;
      } finally {
        if (this.wrapperInitData[i] === Transaction.OBSERVED_ERROR) {
          // The initializer for wrapper i threw an error; initialize the
          // remaining wrappers but silence any exceptions from them to ensure
          // that the first error is the one to bubble up.
          try {
            this.initializeAll(i + 1);
          } catch (err) {
          }
        }
      }
    }
  }

  /**
   * Invokes each of `this.transactionWrappers.close[i]` functions, passing into
   * them the respective return values of `this.transactionWrappers.init[i]`
   * (`close`rs that correspond to initializers that failed will not be
   * invoked).
   */
  closeAll(startIndex) {
    var transactionWrappers = this.transactionWrappers;
    for (var i = startIndex; i < transactionWrappers.length; i++) {
      var wrapper = transactionWrappers[i];
      var initData = this.wrapperInitData[i];
      var errorThrown;
      try {
        // Catching errors makes debugging more difficult, so we start with
        // errorThrown set to true before setting it to false after calling
        // close -- if it's still set to true in the finally block, it means
        // wrapper.close threw.
        errorThrown = true;
        if (initData !== Transaction.OBSERVED_ERROR && wrapper.close) {
          wrapper.close.call(this, initData);
        }
        errorThrown = false;
      } finally {
        if (errorThrown) {
          // The closer for wrapper i threw an error; close the remaining
          // wrappers but silence any exceptions from them to ensure that the
          // first error is the one to bubble up.
          try {
            this.closeAll(i + 1);
          } catch (e) {
          }
        }
      }
    }
    this.wrapperInitData.length = 0;
  }
};


/**
 * Token to look for to determine if an error occurred.
 */
Transaction.OBSERVED_ERROR = {};

class CascadeNode {
	constructor(name, deps){
		this.name = name;
		this.deps = deps;
		this.status = STATUS.DIRTY;
	}
	
	setDirty(){
		this.status = STATUS.DIRTY;
	}
	
	setPending(){
		if(this.status === STATUS.DIRTY){
			this.status = STATUS.PENDING;
		}
	}
	
	setClean(){
		if(this.status === STATUS.DIRTY){
			this.status = STATUS.CLEAN;
		}
	}
	
	isClean(){
		return this.status === STATUS.CLEAN;
	}
	
	isPending(){
		return this.status === STATUS.PENDING;
	}
	
	isDirty(){
		return this.status === STATUS.DIRTY;
	}
}

class CascadeDataState extends CascadeNode{
	constructor(name, deps, factory, initialDeps, initialFactory){
		if(!name){
			error('Invalid name in defining state');
		}
		if(factory === undefined){
			error('Invalid factory in defining state');
		}
		super(name, deps);
		this.factory = factory;
		
		if(initialFactory !== undefined){
			this.initialDeps = initialDeps || [];
			this.initialFactory = initialFactory;
		}
		
		this.definition = null;
	}
}

var STATUS = {
	DIRTY : 1,
	CLEAN : 2,
	PENDING : 3
};

class CascadeDataDerive extends CascadeNode{
	constructor(name, deps, factory){
		if(!name){
			error('Invalid name in defining derived data');
		}
		
		if(typeof factory !== "function"){
			error(`Invalid factory in defining derived data [${name}]`);
		}
		
		super(name, deps);
		
		this.name = name;
		this.deps = deps;
		this.factory = factory;
		
		this.status = STATUS.DIRTY;
	}
}

class CascadeRequire extends CascadeNode{
	constructor(name, deps, factory){
		super(name, deps);
		this.factory = factory;
	}
}

class Cascade extends Transaction {
	constructor(){
		super();
		
		this.statesObj = {};
		this.states = {};
		
		this._requireIdx = 0;
		
		this.subscribers = [];
		
		this.reinitializeTransaction();
		
		this.impactGraph = {};
	}
	
	//define state
	define(name, deps, factory, initialDeps, initialFactory){
		deps = deps || [];
		initialDeps = initialDeps;
		
		if(this.statesObj[name]){
			error('State ${name} is already defined');
		}
		
		this._checkDeps(deps);
		
		this.statesObj[name] = new CascadeDataState(name, deps, factory, initialDeps, initialFactory);
		this._updateImpactGraph(this.statesObj[name]);
		this.batchedUpdate(() => {
			this.adjust(name);
		});
	}
	
	//define derived data
	derive(name, deps, factory){
		deps = deps || [];
		
		if(this.statesObj[name]){
			error('Derived data ${name} is already defined');
		}
		
		this._checkDeps(deps);
		
		this.statesObj[name] = new CascadeDataDerive(name, deps, factory);
		this._updateImpactGraph(this.statesObj[name]);
		this.batchedUpdate(() => {
			this.adjust(name);
		});
	}
	
	wait(deps, factory){
		deps = deps || [];
		this._checkDeps(deps);
		
		var name = '__require__' + this._requireIdx++;
		this.statesObj[name] = new CascadeRequire(name, deps, factory);
		this._updateImpactGraph(this.statesObj[name]);
		this.batchedUpdate(() => {
			this.adjust(name);
		});
	}
	
	_checkDeps(deps){
		//check dependencies
		deps.forEach(depName => {
			if(!this.statesObj.hasOwnProperty(depName)){
				error(`The dependency [${depName}] does not exist`);
			}
		});
	}
	
	_updateImpactGraph(stateObj){
		var deps = (stateObj.deps || []).concat(stateObj.initialDeps || []);
		deps.forEach(nodeName => {
			var edges = this.impactGraph[nodeName] = this.impactGraph[nodeName] || [];
			edges.push(stateObj.name);
		});
	}
	
	_removeInitialDeps(stateObj){
		var initialDeps = stateObj.initialDeps;
		delete stateObj.initialDeps;
		delete stateObj.initialFactory;
		initialDeps.forEach(nodeName => {
			var edges = this.impactGraph[nodeName];
			edges.splice(edges.indexOf(stateObj.name), 1);
		});
	}
	
	_removeWaitNode(stateObj){
		if(stateObj && stateObj instanceof CascadeRequire){
			stateObj.deps.forEach(nodeName => {
				var edges = this.impactGraph[nodeName];
				edges.splice(edges.indexOf(stateObj.name), 1);
			});
			
			delete this.statesObj[stateObj.name];
		}
	}
	
	getStates(){
		var states = {};
		for(var name in this.statesObj){
			var obj = this.statesObj[name];
			if(obj instanceof CascadeRequire){
				continue;
			}
			states[name] = obj.isClean() ? this.states[name] : null;
		}
		return states;
	}
	
	getState(name){
		var stateObj = this.statesObj[name];
		if(stateObj && stateObj.isClean() && !(stateObj instanceof CascadeRequire)){
			return this.states[name];
		}else{
			return null;
		}
	}
	
	setState(name, value){
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
		
		this.batchedUpdate(() => {
			if(oldValue !== this.states[name]){
				//Record updated states
				this.updatedStates[name] = this.states[name];
				//From clean to dirty, Then dirty to clean
				this._adjustChildren(name);
			}
		});
	}
	
	_adjustChildren(name){
		var dirtyChildren = this.getChildren(name);
		dirtyChildren.forEach(name => {
			//From clean/pending to dirty
			this.statesObj[name].setDirty();
		});
		
		dirtyChildren.forEach(name => {
			this.adjust(name);
			if(this.statesObj[name] && !(this.statesObj[name] instanceof CascadeRequire)){
				//Record updated states
				this.updatedStates[name] = this.getState(name);
			}
		});
	}
	
	adjust(name){
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
		if(stateObj instanceof CascadeDataState && "initialFactory" in stateObj){
			deps = deps.concat(stateObj.initialDeps);
		}
		
		var isPending = deps.some(name => {
			this.adjust(name);
			return this.statesObj[name].isPending();
		});
		
		if(isPending){
			//From dirty to pending
			stateObj.setPending();
		}else if(stateObj instanceof CascadeDataState){
			//Get deps first
			var depsValue = stateObj.deps.map(name => {
				return this.states[name];
			});
			
			//compute definition field
			var definition = stateObj.definition = typeof stateObj.factory !== 'function' ? Cascade.types.Fixed(stateObj.factory) : stateObj.factory.apply(null, depsValue);
			
			if(!(definition instanceof DataType)){
				error(`Empty definition in state ${name}`);
			}
			
			//For uninitialized state with an initialFactory, compute its initial value
			if("initialFactory" in stateObj){
				if(typeof stateObj.initialFactory === "function"){
					//Get initialDeps first
					var initialDepsValue = stateObj.initialDeps.map(name => {
						return this.states[name];
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
			var depsValue = stateObj.deps.map(name => {
				return this.states[name];
			});
			
			var stateValue = this.states[name] = stateObj.factory.apply(null, depsValue);
			//Handle Promise value
			if(isPromise(stateValue)){
				var onThen = resolvedValue => {
					//When Promise is resolved, setState its resolved value
					if(stateValue === this.states[name]){
						this.batchedUpdate(() => {
							this.states[name] = resolvedValue;
							
							//Record updated states
							this.updatedStates[name] = this.states[name];
							
							//From pending to dirty
							stateObj.setDirty();
							//From dirty to clean
							stateObj.setClean();
							
							//From pending to dirty, Then dirty to clean
							this._adjustChildren(name);
						}, this);
					}
				};
				
				stateValue.then(resolvedValue => onThen(resolvedValue), () => onThen(null));
				//From dirty to pending
				stateObj.setPending();
			}else{
				//From dirty to clean
				stateObj.setClean();
			}
		}else if(stateObj instanceof CascadeRequire){
			if(typeof stateObj.factory === 'function'){
				this.waitToExecs.push(() => {
					//Get deps first
					var depsValue = stateObj.deps.map(name => {
						return this.states[name];
					});
					stateObj.factory.apply(null, depsValue);
				});
			}
			this._removeWaitNode(this.statesObj[name]);
		}
	}
	
	//deep first
	getChildren(name){
		var list = [].concat(this.impactGraph[name] || []);
		list.forEach(nodeName => {
			this.getChildren(nodeName).forEach(name => {
				if(list.indexOf(name) === -1){
					list.push(name);
				}
			});
		});
		return list;
	}
	
	batchedUpdate(callback){
		if(this._isInTransaction){
			callback.call(this);
		}else{
			this.perform(callback, this);
		}
	}
	
	subscribe(fn){
		if(this.subscribers.indexOf(fn) === -1){
			this.subscribers.push(fn);
		}
	}
	
	unsubscribe(fn){
		var index = this.subscribers.indexOf(fn);
		if(index !== -1){
			this.subscribers.splice(index, 1);
		}
	}
	
	getTransactionWrappers(){
		return [EXEC_WAIT_WRAPPER, NOTIFY_SUBSCRIBERS_WRAPPER];
	}
}

var EXEC_WAIT_WRAPPER = {
	initialize(){
		this.waitToExecs = [];
	},
	close(){
		var callback;
		while(callback = this.waitToExecs.shift()){
			callback();
		}
	}
};

var NOTIFY_SUBSCRIBERS_WRAPPER = {
	initialize(){
		this.updatedStates = {};
	},
	close(){
		if(Object.keys(this.updatedStates).length > 0){
			//excute the subscribers
			this.subscribers.forEach(subscriber => {
				subscriber(this.updatedStates);
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

class DataType {
	constructor(){}
	adapter(){}
	setter(){}
}

Cascade.extendDataType = function(onSetValue){
	var newDataType = class extends DataType {
		constructor(...args){
			super();
			this.args = args;
		}
		setter(newValue, oldValue){
			return onSetValue(newValue, oldValue, ...this.args);
		}
	}
	
	return function(...args){
		return new newDataType(...args);
	}
}

//Some built in types
Cascade.types = {};

/**
 * Read only value
 */
Cascade.types.Fixed = Cascade.extendDataType((valueToSet, oldValue, theOnlyValue) => theOnlyValue);

/**
 * Read/Write value
 */
Cascade.types.Any = Cascade.extendDataType((valueToSet, oldValue) => valueToSet);

/**
 * Enum value
 */
Cascade.types.Enum = Cascade.extendDataType((valueToSet, oldValue, enumList) => {
	if(enumList.indexOf(valueToSet) !== -1){
		return valueToSet;
	}else if(oldValue !== undefined){
		return oldValue;
	}else{
		return enumList[0];
	}
});

Cascade.Promise = resolve => new Promise(resolve);

var isPromise = Cascade.isPromise = obj => obj instanceof Promise;

module.exports = Cascade;