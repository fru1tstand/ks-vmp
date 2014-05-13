/**
 * Visual Music Project: Animate Update 3.0
 * 
 * Kodlee Yin
 * 5-9-14
 */
var AnimateUpdate = function() {
	var self = this;
	
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
		animate: function() {
			self.fields.drawStart = Date.now();
			self.fields.drawDiff = self.fields.drawStart - self.fields.startTime;
			
			if(system.isMethod(self.events.animate))
				self.events.animate(self.fields.drawDiff);
			
			self.fields.startTime = self.fields.drawStart;
			if(self.state.isUpdating)
				window.requestAnimationFrame(self.internal.animate);
		}
	};
	
	this.state = {
		isUpdating: false
	};
	
	//*********************************************************************************** Construct
	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
	if(!system.isMethod(window.requestAnimationFrame))
		return system.addError("Your browser doesn't support calling animation frames");

};

AnimateUpdate.prototype = {
		//*********************************************************************************** Controls
		start: function() {
			if(!system.isMethod(window.requestAnimationFrame))
				return system.addError("Your browser doesn't support calling animation frames");
			this.state.isUpdating = true;
			this.fields.startTime = Date.now();
			window.requestAnimationFrame(this.internal.animate);
		},
		stop: function () {
			this.state.isUpdating = false;
		},
		setCallback: function(p_callback) {
			this.events.animate = p_callback;
		}
};