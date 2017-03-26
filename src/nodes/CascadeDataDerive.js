var util = require('../helper/util');
var CascadeNode = require('./CascadeNode');

//Derived data Class
function CascadeDataDerive(name, deps, factory){
	CascadeNode.call(this, name, deps);
	if(!name){
		util.error('The [name] param of derive api is invalid');
	}
	
	if(!this.deps.length){
		util.error('The [deps] param of derive("' + name + '", ...) api should not be empty');
	}
	
	if(typeof factory !== "function"){
		util.error('The [factory] param of derive("' + name + '", ...) api should be a function');
	}
	
	this.factory = factory;
}
util.assign(CascadeDataDerive.prototype, CascadeNode.prototype);

module.exports = CascadeDataDerive;