var util = require('../helper/util');
var CascadeNode = require('./CascadeNode');

//State Class
function CascadeDataState(name, deps, factory, initialDeps, initialFactory){
	CascadeNode.call(this, name, deps);
	if(!name){
		util.error('The [name] param of define api is invalid');
	}
	if(factory === undefined){
		util.error('The [factory] param of define("' + name + '", ...) api is invalid');
	}
	this.factory = factory;
	
	if(initialFactory !== undefined){
		this.initialDeps = initialDeps || [];
		this.initialFactory = initialFactory;
	}
	
	this.definition = null;
}

util.assign(CascadeDataState.prototype, CascadeNode.prototype);

module.exports = CascadeDataState;