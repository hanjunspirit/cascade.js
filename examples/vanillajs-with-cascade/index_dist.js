(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.Cascade=t()}}(function(){return function t(e,n,i){function r(s,a){if(!n[s]){if(!e[s]){var u="function"==typeof require&&require;if(!a&&u)return u(s,!0);if(o)return o(s,!0);var c=new Error("Cannot find module '"+s+"'");throw c.code="MODULE_NOT_FOUND",c}var f=n[s]={exports:{}};e[s][0].call(f.exports,function(t){var n=e[s][1][t];return r(n?n:t)},f,f.exports,t,e,n,i)}return n[s].exports}for(var o="function"==typeof require&&require,s=0;s<i.length;s++)r(i[s]);return r}({1:[function(t,e,n){"use strict";function i(){if(u.length)throw u.shift()}function r(t){var e;e=a.length?a.pop():new o,e.task=t,s(e)}function o(){this.task=null}var s=t("./raw"),a=[],u=[],c=s.makeRequestCallFromTimer(i);e.exports=r,o.prototype.call=function(){try{this.task.call()}catch(t){r.onerror?r.onerror(t):(u.push(t),c())}finally{this.task=null,a[a.length]=this}}},{"./raw":2}],2:[function(t,e,n){(function(t){"use strict";function n(t){s.length||(o(),a=!0),s[s.length]=t}function i(){for(;u<s.length;){var t=u;if(u+=1,s[t].call(),u>c){for(var e=0,n=s.length-u;e<n;e++)s[e]=s[e+u];s.length-=u,u=0}}s.length=0,u=0,a=!1}function r(t){return function(){function e(){clearTimeout(n),clearInterval(i),t()}var n=setTimeout(e,0),i=setInterval(e,50)}}e.exports=n;var o,s=[],a=!1,u=0,c=1024,f=void 0!==t?t:self,l=f.MutationObserver||f.WebKitMutationObserver;o="function"==typeof l?function(t){var e=1,n=new l(t),i=document.createTextNode("");return n.observe(i,{characterData:!0}),function(){e=-e,i.data=e}}(i):r(i),n.requestFlush=o,n.makeRequestCallFromTimer=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],3:[function(t,e,n){"use strict";e.exports=t("./lib")},{"./lib":8}],4:[function(t,e,n){"use strict";function i(){}function r(t){try{return t.then}catch(t){return _=t,g}}function o(t,e){try{return t(e)}catch(t){return _=t,g}}function s(t,e,n){try{t(e,n)}catch(t){return _=t,g}}function a(t){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._45=0,this._81=0,this._65=null,this._54=null,t!==i&&y(t,this)}function u(t,e,n){return new t.constructor(function(r,o){var s=new a(i);s.then(r,o),c(t,new d(e,n,s))})}function c(t,e){for(;3===t._81;)t=t._65;if(a._10&&a._10(t),0===t._81)return 0===t._45?(t._45=1,void(t._54=e)):1===t._45?(t._45=2,void(t._54=[t._54,e])):void t._54.push(e);f(t,e)}function f(t,e){v(function(){var n=1===t._81?e.onFulfilled:e.onRejected;if(null===n)return void(1===t._81?l(e.promise,t._65):h(e.promise,t._65));var i=o(n,t._65);i===g?h(e.promise,_):l(e.promise,i)})}function l(t,e){if(e===t)return h(t,new TypeError("A promise cannot be resolved with itself."));if(e&&("object"==typeof e||"function"==typeof e)){var n=r(e);if(n===g)return h(t,_);if(n===t.then&&e instanceof a)return t._81=3,t._65=e,void p(t);if("function"==typeof n)return void y(n.bind(e),t)}t._81=1,t._65=e,p(t)}function h(t,e){t._81=2,t._65=e,a._97&&a._97(t,e),p(t)}function p(t){if(1===t._45&&(c(t,t._54),t._54=null),2===t._45){for(var e=0;e<t._54.length;e++)c(t,t._54[e]);t._54=null}}function d(t,e,n){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=n}function y(t,e){var n=!1,i=s(t,function(t){n||(n=!0,l(e,t))},function(t){n||(n=!0,h(e,t))});n||i!==g||(n=!0,h(e,_))}var v=t("asap/raw"),_=null,g={};e.exports=a,a._10=null,a._97=null,a._61=i,a.prototype.then=function(t,e){if(this.constructor!==a)return u(this,t,e);var n=new a(i);return c(this,new d(t,e,n)),n}},{"asap/raw":2}],5:[function(t,e,n){"use strict";var i=t("./core.js");e.exports=i,i.prototype.done=function(t,e){(arguments.length?this.then.apply(this,arguments):this).then(null,function(t){setTimeout(function(){throw t},0)})}},{"./core.js":4}],6:[function(t,e,n){"use strict";function i(t){var e=new r(r._61);return e._81=1,e._65=t,e}var r=t("./core.js");e.exports=r;var o=i(!0),s=i(!1),a=i(null),u=i(void 0),c=i(0),f=i("");r.resolve=function(t){if(t instanceof r)return t;if(null===t)return a;if(void 0===t)return u;if(t===!0)return o;if(t===!1)return s;if(0===t)return c;if(""===t)return f;if("object"==typeof t||"function"==typeof t)try{var e=t.then;if("function"==typeof e)return new r(e.bind(t))}catch(t){return new r(function(e,n){n(t)})}return i(t)},r.all=function(t){var e=Array.prototype.slice.call(t);return new r(function(t,n){function i(s,a){if(a&&("object"==typeof a||"function"==typeof a)){if(a instanceof r&&a.then===r.prototype.then){for(;3===a._81;)a=a._65;return 1===a._81?i(s,a._65):(2===a._81&&n(a._65),void a.then(function(t){i(s,t)},n))}var u=a.then;if("function"==typeof u){return void new r(u.bind(a)).then(function(t){i(s,t)},n)}}e[s]=a,0==--o&&t(e)}if(0===e.length)return t([]);for(var o=e.length,s=0;s<e.length;s++)i(s,e[s])})},r.reject=function(t){return new r(function(e,n){n(t)})},r.race=function(t){return new r(function(e,n){t.forEach(function(t){r.resolve(t).then(e,n)})})},r.prototype.catch=function(t){return this.then(null,t)}},{"./core.js":4}],7:[function(t,e,n){"use strict";var i=t("./core.js");e.exports=i,i.prototype.finally=function(t){return this.then(function(e){return i.resolve(t()).then(function(){return e})},function(e){return i.resolve(t()).then(function(){throw e})})}},{"./core.js":4}],8:[function(t,e,n){"use strict";e.exports=t("./core.js"),t("./done.js"),t("./finally.js"),t("./es6-extensions.js"),t("./node-extensions.js"),t("./synchronous.js")},{"./core.js":4,"./done.js":5,"./es6-extensions.js":6,"./finally.js":7,"./node-extensions.js":9,"./synchronous.js":10}],9:[function(t,e,n){"use strict";function i(t,e){for(var n=[],i=0;i<e;i++)n.push("a"+i);var r=["return function ("+n.join(",")+") {","var self = this;","return new Promise(function (rs, rj) {","var res = fn.call(",["self"].concat(n).concat([a]).join(","),");","if (res &&",'(typeof res === "object" || typeof res === "function") &&','typeof res.then === "function"',") {rs(res);}","});","};"].join("");return Function(["Promise","fn"],r)(o,t)}function r(t){for(var e=Math.max(t.length-1,3),n=[],i=0;i<e;i++)n.push("a"+i);var r=["return function ("+n.join(",")+") {","var self = this;","var args;","var argLength = arguments.length;","if (arguments.length > "+e+") {","args = new Array(arguments.length + 1);","for (var i = 0; i < arguments.length; i++) {","args[i] = arguments[i];","}","}","return new Promise(function (rs, rj) {","var cb = "+a+";","var res;","switch (argLength) {",n.concat(["extra"]).map(function(t,e){return"case "+e+":res = fn.call("+["self"].concat(n.slice(0,e)).concat("cb").join(",")+");break;"}).join(""),"default:","args[argLength] = cb;","res = fn.apply(self, args);","}","if (res &&",'(typeof res === "object" || typeof res === "function") &&','typeof res.then === "function"',") {rs(res);}","});","};"].join("");return Function(["Promise","fn"],r)(o,t)}var o=t("./core.js"),s=t("asap");e.exports=o,o.denodeify=function(t,e){return"number"==typeof e&&e!==1/0?i(t,e):r(t)};var a="function (err, res) {if (err) { rj(err); } else { rs(res); }}";o.nodeify=function(t){return function(){var e=Array.prototype.slice.call(arguments),n="function"==typeof e[e.length-1]?e.pop():null,i=this;try{return t.apply(this,arguments).nodeify(n,i)}catch(t){if(null===n||void 0===n)return new o(function(e,n){n(t)});s(function(){n.call(i,t)})}}},o.prototype.nodeify=function(t,e){if("function"!=typeof t)return this;this.then(function(n){s(function(){t.call(e,null,n)})},function(n){s(function(){t.call(e,n)})})}},{"./core.js":4,asap:1}],10:[function(t,e,n){"use strict";var i=t("./core.js");e.exports=i,i.enableSynchronous=function(){i.prototype.isPending=function(){return 0==this.getState()},i.prototype.isFulfilled=function(){return 1==this.getState()},i.prototype.isRejected=function(){return 2==this.getState()},i.prototype.getValue=function(){if(3===this._81)return this._65.getValue();if(!this.isFulfilled())throw new Error("Cannot get a value of an unfulfilled promise.");return this._65},i.prototype.getReason=function(){if(3===this._81)return this._65.getReason();if(!this.isRejected())throw new Error("Cannot get a rejection reason of a non-rejected promise.");return this._65},i.prototype.getState=function(){return 3===this._81?this._65.getState():this._81===-1||this._81===-2?0:this._81}},i.disableSynchronous=function(){i.prototype.isPending=void 0,i.prototype.isFulfilled=void 0,i.prototype.isRejected=void 0,i.prototype.getValue=void 0,i.prototype.getReason=void 0,i.prototype.getState=void 0}},{"./core.js":4}],11:[function(t,e,n){"use strict";function i(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function r(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function o(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function s(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function a(t){"undefined"!=typeof console&&console.warn(t)}function u(t){throw"undefined"!=typeof console&&console.error(t),new Error(t)}var c=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),f=t("promise"),l=function(){function t(){s(this,t)}return c(t,[{key:"reinitializeTransaction",value:function(){this.transactionWrappers=this.getTransactionWrappers(),this.wrapperInitData?this.wrapperInitData.length=0:this.wrapperInitData=[],this._isInTransaction=!1}},{key:"getTransactionWrappers",value:function(){return null}},{key:"isInTransaction",value:function(){return!!this._isInTransaction}},{key:"perform",value:function(t,e,n,i,r,o,s,a){var u,c;try{this._isInTransaction=!0,u=!0,this.initializeAll(0),c=t.call(e,n,i,r,o,s,a),u=!1}finally{try{if(u)try{this.closeAll(0)}catch(t){}else this.closeAll(0)}finally{this._isInTransaction=!1}}return c}},{key:"initializeAll",value:function(e){for(var n=this.transactionWrappers,i=e;i<n.length;i++){var r=n[i];try{this.wrapperInitData[i]=t.OBSERVED_ERROR,this.wrapperInitData[i]=r.initialize?r.initialize.call(this):null}finally{if(this.wrapperInitData[i]===t.OBSERVED_ERROR)try{this.initializeAll(i+1)}catch(t){}}}}},{key:"closeAll",value:function(e){for(var n=this.transactionWrappers,i=e;i<n.length;i++){var r,o=n[i],s=this.wrapperInitData[i];try{r=!0,s!==t.OBSERVED_ERROR&&o.close&&o.close.call(this,s),r=!1}finally{if(r)try{this.closeAll(i+1)}catch(t){}}}this.wrapperInitData.length=0}}]),t}();l.OBSERVED_ERROR={};var h=function(){function t(e,n){s(this,t),this.name=e,this.deps=n,this.status=d.DIRTY}return c(t,[{key:"setDirty",value:function(){this.status=d.DIRTY}},{key:"setPending",value:function(){this.status===d.DIRTY&&(this.status=d.PENDING)}},{key:"setClean",value:function(){this.status===d.DIRTY&&(this.status=d.CLEAN)}},{key:"isClean",value:function(){return this.status===d.CLEAN}},{key:"isPending",value:function(){return this.status===d.PENDING}},{key:"isDirty",value:function(){return this.status===d.DIRTY}}]),t}(),p=function(t){function e(t,n,i,o,a){s(this,e),t||u("Invalid name in defining state"),void 0===i&&u("Invalid factory in defining state");var c=r(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return c.factory=i,void 0!==a&&(c.initialDeps=o||[],c.initialFactory=a),c.definition=null,c}return o(e,t),e}(h),d={DIRTY:1,CLEAN:2,PENDING:3},y=function(t){function e(t,n,i){s(this,e),t||u("Invalid name in defining derived data"),"function"!=typeof i&&u("Invalid factory in defining derived data ["+t+"]");var o=r(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return o.name=t,o.deps=n,o.factory=i,o.status=d.DIRTY,o}return o(e,t),e}(h),v=function(t){function e(t,n,i){s(this,e);var o=r(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return o.factory=i,o}return o(e,t),e}(h),_=function(t){function e(){s(this,e);var t=r(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return t.statesObj={},t.states={},t._requireIdx=0,t.subscribers=[],t.reinitializeTransaction(),t}return o(e,t),c(e,[{key:"define",value:function(t,e,n,i,r){var o=this;e=e||[],i=i,this.statesObj[t]&&u("State ${name} is already defined"),this._checkDeps(e),this.statesObj[t]=new p(t,e,n,i,r),this.batchedUpdate(function(){o.adjust(t)})}},{key:"derive",value:function(t,e,n){var i=this;e=e||[],this.statesObj[t]&&u("Derived data ${name} is already defined"),this._checkDeps(e),this.statesObj[t]=new y(t,e,n),this.batchedUpdate(function(){i.adjust(t)})}},{key:"wait",value:function(t,e){var n=this;t=t||[],this._checkDeps(t);var i="__require__"+this._requireIdx++;this.statesObj[i]=new v(i,t,e),this.batchedUpdate(function(){n.adjust(i)})}},{key:"_checkDeps",value:function(t){var e=this;t.forEach(function(t){e.statesObj.hasOwnProperty(t)||u("The dependency ["+t+"] does not exist")})}},{key:"getStates",value:function(){var t={};for(var e in this.statesObj){var n=this.statesObj[e];n instanceof v||(t[e]=n.isClean()?this.states[e]:null)}return t}},{key:"getState",value:function(t){var e=this.statesObj[t];return!e||!e.isClean()||e instanceof v?null:this.states[t]}},{key:"setState",value:function(t,e){var n=this,i=this.statesObj[t];if(i){if(i instanceof y&&u("You can not set a derived data!"),i.isPending())return void a("You can't set a pending state!");var r=i.definition,o=this.states[t];this.states[t]=r.setter(e,o),this.batchedUpdate(function(){o!==n.states[t]&&(n.updatedStates[t]=n.states[t],n._adjustChildren(t))})}}},{key:"_adjustChildren",value:function(t){var e=this,n=this.getChildren(t);n.forEach(function(t){e.statesObj[t].setDirty()}),n.forEach(function(t){e.adjust(t),e.statesObj[t]&&(e.updatedStates[t]=e.getState(t))})}},{key:"adjust",value:function(t){var n=this,i=this.statesObj[t];if(i.isDirty()){if(!this._isInTransaction)return void u("adjust calls must be in Transaction");var r=i.deps;i instanceof p&&"initialFactory"in i&&(r=r.concat(i.initialDeps));if(r.some(function(t){return n.adjust(t),n.statesObj[t].isPending()}))i.setPending();else if(i instanceof p){var o=i.deps.map(function(t){return n.states[t]}),s=i.definition="function"!=typeof i.factory?e.types.Fixed(i.factory):i.factory.apply(null,o);if(s instanceof j||u("Empty definition in state "+t),"initialFactory"in i){if("function"==typeof i.initialFactory)var a=i.initialDeps.map(function(t){return n.states[t]}),c=i.initialFactory.apply(null,a);else var c=i.initialFactory;this.states[t]=s.setter(c),delete i.initialDeps,delete i.initialFactory}else this.states[t]=s.setter(this.states[t]);i.setClean()}else if(i instanceof y){var o=i.deps.map(function(t){return n.states[t]}),f=this.states[t]=i.factory.apply(null,o);w(f)?(f.then(function(e){f===n.states[t]&&n.batchedUpdate(function(){n.states[t]=e,n.updatedStates[t]=n.states[t],i.setDirty(),i.setClean(),n._adjustChildren(t)},n)}),i.setPending()):i.setClean()}else i instanceof v&&("function"==typeof i.factory&&this.waitToExecs.push(function(){var t=i.deps.map(function(t){return n.states[t]});i.factory.apply(null,t)}),delete this.statesObj[t])}}},{key:"getChildren",value:function(t,e){e=e||[];this.statesObj[t];for(var n in this.statesObj){var i=this.statesObj[n];e.indexOf(n)===-1&&(i.deps.indexOf(t)!==-1||"initialFactory"in i&&i.initialDeps.indexOf(t)!==-1)&&(e.push(n),this.getChildren(n,e))}return e}},{key:"batchedUpdate",value:function(t){this._isInTransaction?t.call(this):this.perform(t,this)}},{key:"subscribe",value:function(t){this.subscribers.indexOf(t)===-1&&this.subscribers.push(t)}},{key:"unsubscribe",value:function(t){var e=this.subscribers.indexOf(t);e!==-1&&this.subscribers.splice(e,1)}},{key:"getTransactionWrappers",value:function(){return[g,b]}}]),e}(l),g={initialize:function(){this.waitToExecs=[]},close:function(){for(var t;t=this.waitToExecs.shift();)t()}},b={initialize:function(){this.updatedStates={}},close:function(){var t=this;Object.keys(this.updatedStates).length>0&&this.subscribers.forEach(function(e){e(t.updatedStates)}),this.updatedStates={}}},j=function(){function t(){s(this,t)}return c(t,[{key:"adapter",value:function(){}},{key:"setter",value:function(){}}]),t}();_.extendDataType=function(t){var e=function(e){function n(){s(this,n);for(var t=r(this,(n.__proto__||Object.getPrototypeOf(n)).call(this)),e=arguments.length,i=Array(e),o=0;o<e;o++)i[o]=arguments[o];return t.args=i,t}return o(n,e),c(n,[{key:"setter",value:function(e,n){return t.apply(void 0,[e,n].concat(i(this.args)))}}]),n}(j);return function(){for(var t=arguments.length,n=Array(t),i=0;i<t;i++)n[i]=arguments[i];return new(Function.prototype.bind.apply(e,[null].concat(n)))}},_.types={},_.types.Fixed=_.extendDataType(function(t,e,n){return n}),_.types.Any=_.extendDataType(function(t,e){return t}),_.types.Enum=_.extendDataType(function(t,e,n){return n.indexOf(t)!==-1?t:void 0!==e?e:n[0]}),_.Promise=function(t){return new f(t)};var w=_.isPromise=function(t){return t instanceof f};e.exports=_},{promise:3}]},{},[11])(11)});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
"use strict";function onSetValue(e,a,r,t){if("number"==typeof e){var u=Math.round(e);return u<=r?r:u>=t?t:u}return void 0!==a?a:r}var Cascade=require("../cascade");module.exports=Cascade.extendDataType(onSetValue);
},{"../cascade":1}],3:[function(require,module,exports){
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

},{"./model":4,"./view":5}],4:[function(require,module,exports){
'use strict';
var Cascade = require('../../');
//var Cascade = require('../../dist/cascade');
var Interger = require('../../dist/types/interger');

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
	return Interger(1, stock);
});


},{"../../":1,"../../dist/types/interger":2}],5:[function(require,module,exports){
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
},{}]},{},[3]);
