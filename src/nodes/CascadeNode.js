function CascadeNode(name, deps){
	this.name = name;
	this.deps = deps || [];
	this.status = STATUS.DIRTY;
}

CascadeNode.prototype = {
	setDirty : function(){
		this.status = STATUS.DIRTY;
	},
	setPending : function(){
		if(this.status === STATUS.DIRTY){
			this.status = STATUS.PENDING;
		}
	},
	setClean : function(){
		if(this.status === STATUS.DIRTY){
			this.status = STATUS.CLEAN;
		}
	},
	isClean : function(){
		return this.status === STATUS.CLEAN;
	},
	isPending : function(){
		return this.status === STATUS.PENDING;
	},
	isDirty : function(){
		return this.status === STATUS.DIRTY;
	}
}

var STATUS = {
	DIRTY : 1,
	CLEAN : 2,
	PENDING : 3
};

module.exports = CascadeNode;