var util = require('../helper/util');
var CascadeNode = require('./CascadeNode');

//Derived data Class
function CascadeDataDerive(name, deps, factory){
	CascadeNode.call(this, name, deps);
	if(!name){
		error('Invalid name in defining derived data');
	}
	
	if(typeof factory !== "function"){
		error('Invalid factory in defining derived data ' + name);
	}
	
	this.factory = factory;
}
util.assign(CascadeDataDerive.prototype, CascadeNode.prototype);

module.exports = CascadeDataDerive;