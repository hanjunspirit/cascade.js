function uglyPromise(callback){
	this.status = 'Pending';
	this.onResolveCallback = [];
	this.resolvedValue = null;
	
	var that = this;
	function onResolve(resolvedValue){
		that.status = 'Resolved';
		that.resolvedValue = resolvedValue;
		for(var i = 0; i < that.onResolveCallback.length; i++){
			that.onResolveCallback[i].call(null, resolvedValue);
		}
		that.onResolveCallback[i] = [];
	}
	
	callback(onResolve);
}
uglyPromise.prototype.then = function(onResolve){
	var that = this;
	if(this.status === 'Pending'){
		if(onResolve){
			this.onResolveCallback.push(onResolve);
		}
	}else{
		if(onResolve){
			setTimeout(function(){
				onResolve.call(null, that.resolvedValue);
			})
		}
	}
}

module.exports = uglyPromise;