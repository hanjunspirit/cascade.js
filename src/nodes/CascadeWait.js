var util = require('../helper/util');
var CascadeNode = require('./CascadeNode');

//cascadeObj.wait Class
function CascadeWait(name, deps, factory){
	CascadeNode.call(this, name, deps);
	this.factory = factory;
}
util.assign(CascadeWait.prototype, CascadeNode.prototype);

module.exports = CascadeWait;