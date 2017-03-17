(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var model = require('./model');
var view = require('./view');

class controller {
	constructor(){
		this.model = model;
		this.view = new view();
		
		this.view.render(this.model.getStates());
		
		this.model.subscribe(updatedStates => {
			this.view.render(updatedStates);
		});
		
		this.view.bind('clickSize', (obj) => {
			this.model.setState('size', obj.option);
		});
		
		this.view.bind('clickColor', (obj) => {
			this.model.setState('color', obj.option);
		});
		
		this.view.bind('quantityInput', (quantity) => {
			this.model.setState('quantity', quantity);
		});
	}
}

module.exports = new controller();

},{"./model":2,"./view":3}],2:[function(require,module,exports){
'use strict';
var Cascade = require('../../src/cascade');
var Ingerger = require('../../src/types/interger');

var cascadeObj = module.exports = new Cascade();

cascadeObj.define('config', null, {
	S : {
		Green : 5,
		Red : 6
	},
	M : {
		White : 13,
		Black : 15
	}
});

cascadeObj.derive('allowedSizes', ['config'], config => Object.keys(config));

cascadeObj.define('size', ['allowedSizes'], allowedSizes => {
	return Cascade.types.Enum(allowedSizes);
});

cascadeObj.derive('allowedColors', ['config', 'size'], (config, size) => Object.keys(config[size]));

cascadeObj.define('color', ['allowedColors'], allowedColors => {
	return Cascade.types.Enum(allowedColors);
});

cascadeObj.derive('stock', ['config', 'size', 'color'], (config, size, color) => config[size][color]);

cascadeObj.define('quantity', ['stock'], stock => {
	return Ingerger(1, stock);
});


},{"../../src/cascade":14,"../../src/types/interger":15}],3:[function(require,module,exports){
'use strict';
function qs(selector) {
	return document.querySelector(selector);
}

function qsa(selector, scope) {
	return (scope || document).querySelectorAll(selector);
}

// Attach a handler to event for all elements that match the selector,
	// now or in the future, based on a root element
function delegate(target, selector, type, handler) {
	function dispatchEvent(event) {
		var targetElement = event.target;
		var potentialElements = qsa(selector, target);
		var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

		if (hasMatch) {
			handler.call(targetElement, event);
		}
	}

	// https://developer.mozilla.org/en-US/docs/Web/Events/blur
	var useCapture = type === 'blur' || type === 'focus';

	target.addEventListener(type, dispatchEvent, useCapture);
};

class view {
	
	constructor(){
		this.sizeOptions = qs('#size_options');
		this.colorOptions = qs('#color_options');
		this.quantity = qs('#quantity');
	}
	
	render(states){
		if(states.allowedSizes !== undefined){
			this.renderSizeOptions(states.allowedSizes);
		}
		
		if(states.allowedColors !== undefined){
			this.renderColorOptions(states.allowedColors);
		}
		
		if(states.size !== undefined){
			this.renderSelectedSize(states.size);
		}
		
		if(states.color !== undefined){
			this.renderSelectedColor(states.color);
		}
		
		if(states.quantity !== undefined){
			this.setQuantity(states.quantity);
		}
	}
	
	renderSizeOptions(options){
		this.sizeOptions.innerHTML = options.map(option => {
			return '<label data-option="' + option + '"><span>' + option + '</span></label>';
		}).join("");
	}
	
	renderColorOptions(options){
		this.colorOptions.innerHTML = options.map(option => {
			return '<label data-option="' + option + '"><span>' + option + '</span></label>';
		}).join("");
	}
	
	renderSelectedSize(size){
		Array.prototype.slice.call(qsa('label', this.sizeOptions)).forEach(domOption => {
			domOption.className = domOption.dataset.option === size ? 'current' : '';
		});
	}
	
	renderSelectedColor(color){
		Array.prototype.slice.call(qsa('label', this.colorOptions)).forEach(domOption => {
			domOption.className = domOption.dataset.option === color ? 'current' : '';
		});
	}
	
	setQuantity(quantity){
		this.quantity.value = quantity;
	}
	
	bind(event, handler){
		if (event === 'clickSize') {
			delegate(this.sizeOptions, 'span', 'click', function () {
				if(this.parentNode.nodeName === 'LABEL'){
					handler({
						option : this.parentNode.dataset.option,
					});
				}
			});
		}else if(event === 'clickColor'){
			delegate(this.colorOptions, 'span', 'click', function () {
				if(this.parentNode.nodeName === 'LABEL'){
					handler({
						option : this.parentNode.dataset.option
					});
				}
			});
		}else if(event === 'quantityInput'){
			this.quantity.addEventListener('input', () => {
				handler(this.quantity.value.replace(/[^0-9]/g, '') * 1);
			});
			
			qs('#quantity_plus').addEventListener('click', () => {
				handler(this.quantity.value.replace(/[^0-9]/g, '') * 1 + 1);
			});
			
			qs('#quantity_reduce').addEventListener('click', () => {
				handler(this.quantity.value.replace(/[^0-9]/g, '') * 1 - 1);
			});
		}
	}
}

module.exports = view;
},{}],4:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require("./raw");
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"./raw":5}],5:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` or `self` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.

/* globals self */
var scope = typeof global !== "undefined" ? global : self;
var BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
'use strict';

module.exports = require('./lib')

},{"./lib":11}],7:[function(require,module,exports){
'use strict';

var asap = require('asap/raw');

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function');
  }
  this._45 = 0;
  this._81 = 0;
  this._65 = null;
  this._54 = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._10 = null;
Promise._97 = null;
Promise._61 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
};
function handle(self, deferred) {
  while (self._81 === 3) {
    self = self._65;
  }
  if (Promise._10) {
    Promise._10(self);
  }
  if (self._81 === 0) {
    if (self._45 === 0) {
      self._45 = 1;
      self._54 = deferred;
      return;
    }
    if (self._45 === 1) {
      self._45 = 2;
      self._54 = [self._54, deferred];
      return;
    }
    self._54.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._81 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._81 === 1) {
        resolve(deferred.promise, self._65);
      } else {
        reject(deferred.promise, self._65);
      }
      return;
    }
    var ret = tryCallOne(cb, self._65);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._81 = 3;
      self._65 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._81 = 1;
  self._65 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._81 = 2;
  self._65 = newValue;
  if (Promise._97) {
    Promise._97(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._45 === 1) {
    handle(self, self._54);
    self._54 = null;
  }
  if (self._45 === 2) {
    for (var i = 0; i < self._54.length; i++) {
      handle(self, self._54[i]);
    }
    self._54 = null;
  }
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  })
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

},{"asap/raw":5}],8:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};

},{"./core.js":7}],9:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js');

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._61);
  p._81 = 1;
  p._65 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._81 === 3) {
            val = val._65;
          }
          if (val._81 === 1) return res(i, val._65);
          if (val._81 === 2) reject(val._65);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

},{"./core.js":7}],10:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};

},{"./core.js":7}],11:[function(require,module,exports){
'use strict';

module.exports = require('./core.js');
require('./done.js');
require('./finally.js');
require('./es6-extensions.js');
require('./node-extensions.js');
require('./synchronous.js');

},{"./core.js":7,"./done.js":8,"./es6-extensions.js":9,"./finally.js":10,"./node-extensions.js":12,"./synchronous.js":13}],12:[function(require,module,exports){
'use strict';

// This file contains then/promise specific extensions that are only useful
// for node.js interop

var Promise = require('./core.js');
var asap = require('asap');

module.exports = Promise;

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  if (
    typeof argumentCount === 'number' && argumentCount !== Infinity
  ) {
    return denodeifyWithCount(fn, argumentCount);
  } else {
    return denodeifyWithoutCount(fn);
  }
}

var callbackFn = (
  'function (err, res) {' +
  'if (err) { rj(err); } else { rs(res); }' +
  '}'
);
function denodeifyWithCount(fn, argumentCount) {
  var args = [];
  for (var i = 0; i < argumentCount; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'return new Promise(function (rs, rj) {',
    'var res = fn.call(',
    ['self'].concat(args).concat([callbackFn]).join(','),
    ');',
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');
  return Function(['Promise', 'fn'], body)(Promise, fn);
}
function denodeifyWithoutCount(fn) {
  var fnLength = Math.max(fn.length - 1, 3);
  var args = [];
  for (var i = 0; i < fnLength; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'var args;',
    'var argLength = arguments.length;',
    'if (arguments.length > ' + fnLength + ') {',
    'args = new Array(arguments.length + 1);',
    'for (var i = 0; i < arguments.length; i++) {',
    'args[i] = arguments[i];',
    '}',
    '}',
    'return new Promise(function (rs, rj) {',
    'var cb = ' + callbackFn + ';',
    'var res;',
    'switch (argLength) {',
    args.concat(['extra']).map(function (_, index) {
      return (
        'case ' + (index) + ':' +
        'res = fn.call(' + ['self'].concat(args.slice(0, index)).concat('cb').join(',') + ');' +
        'break;'
      );
    }).join(''),
    'default:',
    'args[argLength] = cb;',
    'res = fn.apply(self, args);',
    '}',
    
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');

  return Function(
    ['Promise', 'fn'],
    body
  )(Promise, fn);
}

Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
}

},{"./core.js":7,"asap":4}],13:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.enableSynchronous = function () {
  Promise.prototype.isPending = function() {
    return this.getState() == 0;
  };

  Promise.prototype.isFulfilled = function() {
    return this.getState() == 1;
  };

  Promise.prototype.isRejected = function() {
    return this.getState() == 2;
  };

  Promise.prototype.getValue = function () {
    if (this._81 === 3) {
      return this._65.getValue();
    }

    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._65;
  };

  Promise.prototype.getReason = function () {
    if (this._81 === 3) {
      return this._65.getReason();
    }

    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._65;
  };

  Promise.prototype.getState = function () {
    if (this._81 === 3) {
      return this._65.getState();
    }
    if (this._81 === -1 || this._81 === -2) {
      return 0;
    }

    return this._81;
  };
};

Promise.disableSynchronous = function() {
  Promise.prototype.isPending = undefined;
  Promise.prototype.isFulfilled = undefined;
  Promise.prototype.isRejected = undefined;
  Promise.prototype.getValue = undefined;
  Promise.prototype.getReason = undefined;
  Promise.prototype.getState = undefined;
};

},{"./core.js":7}],14:[function(require,module,exports){
/**
 * Cascade.js 1.0.0 Beta1 | https://github.com/hanjunspirit/cascade.js/blob/master/LICENSE
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
		this.batchedUpdate(() => {
			this.adjust(name);
		});
	}
	
	wait(deps, factory){
		deps = deps || [];
		this._checkDeps(deps);
		var name = '__require__' + this._requireIdx++;
		this.statesObj[name] = new CascadeRequire(name, deps, factory);
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
			if(this.statesObj[name]){
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
				
				delete stateObj.initialDeps;
				delete stateObj.initialFactory;
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
				stateValue.then(resolvedValue => {
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
				});
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
			delete this.statesObj[name];
		}
	}
	
	getChildren(name, list){
		list = list || [];
		var stateObj = this.statesObj[name];
		
		for(var _name in this.statesObj){
			var _stateObj = this.statesObj[_name];
			if(list.indexOf(_name) === -1 && (_stateObj.deps.indexOf(name) !== -1 || "initialFactory" in _stateObj && _stateObj.initialDeps.indexOf(name) !== -1)){
				list.push(_name);
				this.getChildren(_name, list);
			}
		}
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
},{"promise":6}],15:[function(require,module,exports){
var Cascade = require('../cascade');
function onSetValue(valueToSet, oldValue, min, max){
	if(typeof valueToSet === 'number'){
		number = Math.round(valueToSet);
		if(number <= min){
			return min;
		}
		
		if(number >= max){
			return max;
		}
		
		return number;
	}
	
	if(oldValue !== undefined){
		return oldValue;
	}
	
	return min;
}

module.exports = Cascade.extendDataType(onSetValue);
},{"../cascade":14}]},{},[1]);
