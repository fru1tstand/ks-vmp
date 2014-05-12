/**
 * Visual Music Project: Animate Update 1.0
 * 
 * Kodlee Yin
 * 5-9-14
 */
var AnimateUpdate = function() {
	//Internal Object Vars
	var
		//Animation Frame
		iv_requestAnimationFrame = null,
		
		//Drawing
		iv_drawStart = 0,
		iv_drawDiff = 0,
		iv_startTime = 0,
		iv_isUpdating = false,
		iv_animationCallback = null;
	
	//*********************************************************************************** Internals
	var animate = function() {
		iv_drawStart = Date.now();
		iv_drawDiff = iv_drawStart - iv_startTime;
		
		if(isMethod(iv_animationCallback))
			iv_animationCallback(iv_drawDiff);
		
		iv_startTime = iv_drawStart;
		
		if(iv_isUpdating)
			iv_requestAnimationFrame(Animate);
	};
	
	//*********************************************************************************** Construct
	this.CONSTRUCTOR = function() {
		iv_requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
		if(iv_requestAnimationFrame == null)
			return addError("Your browser doesn't support calling animation frames");
	};
	this.CONSTRUCTOR();
	
	//*********************************************************************************** Controls
	this.start = function() {
		if(iv_requestAnimationFrame == null)
			return addError("Your browser doesn't support calling animation frames");
		
		iv_isUpdating = true;
		iv_startTime = Date.now();
		iv_requestAnimationFrame(Animate);
	};
	this.stop = function () {
		iv_isUpdating = false;
	};
	this.setCallback = function(p_callback) {
		iv_animationCallback = p_callback;
	};
	

};