/**
 * Visual Music Project: Animate Update 3.0
 * 
 * Kodlee Yin
 * 5-9-14
 */
var AnimateUpdate = function() {
	//Internal Object Vars
	this.fields = {
		drawStart: 0,
		drawDiff: 0,
		startTime: 0
	};
	
	this.events = {
		animate: null
	};
	
	this.internal = {
		requestAnimationFrame: null,
		animate: function() {
			this.fields.drawStart = Date.now();
			this.fields.drawDiff = this.fields.drawStart - this.fields.startTime;
			
			if(isMethod(this.internal.animationCallback))
				this.events.animate(this.fields.drawDiff);
			
			this.fields.startTime = this.fields.drawStart;
			
			if(this.state.isUpdating)
				this.internal.requestAnimationFrame(this.internal.animate);
		}
	};
	
	this.state = {
		isUpdating: false
	};
	
	//*********************************************************************************** Construct
	iv_requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
	if(iv_requestAnimationFrame == null)
		return system.addError("Your browser doesn't support calling animation frames");

};

AnimateUpdate.prototype = {
		//*********************************************************************************** Controls
		start: function() {
			if(this.internal.requestAnimationFrame == null)
				return system.addError("Your browser doesn't support calling animation frames");
			
			this.state.isUpdating = true;
			this.fields.startTime = Date.now();
			this.internal.requestAnimationFrame(this.internal.animate);
		},
		stop: function () {
			this.state.isUpdating = false;
		},
		setCallback: function(p_callback) {
			this.events.animate = p_callback;
		}
};