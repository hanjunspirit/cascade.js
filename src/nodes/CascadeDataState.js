var util = require('../helper/util');
var CascadeNode = require('./CascadeNode');

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

util.assign(CascadeDataState.prototype, CascadeNode.prototype);

module.exports = CascadeDataState;