function uglyPromise(callback){
	this.status = 'Pending';
	this.onResolveCallback = [];
	
	var that = this;
	function onResolve(resolvedValue){
		that.status = 'Resolved';
		for(var i = 0; i < that.onResolveCallback.length; i++){
			that.onResolveCallback[i](resolvedValue);
		}
		that.onResolveCallback[i] = [];
	}
	
	callback(onResolve);
}
uglyPromise.prototype.then = function(onResolve){
	if(this.status === 'Pending'){
		if(onResolve){
			this.onResolveCallback.push(onResolve);
		}
	}else{
		if(onResolve){
			onResolve();
		}
	}
}

module.exports = uglyPromise;