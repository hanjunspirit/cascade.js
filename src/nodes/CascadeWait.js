var util = require('../helper/util');
var CascadeNode = require('./CascadeNode');

//cascadeObj.wait Class
function CascadeWait(name, deps, factory){
	CascadeNode.call(this, name, deps);
	
	if(!this.deps.length){
		util.error('The [deps] param of wait api should not be empty');
	}
	this.factory = factory;
}
util.assign(CascadeWait.prototype, CascadeNode.prototype);

module.exports = CascadeWait;