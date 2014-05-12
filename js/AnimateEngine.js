/**
 * Visual Music Project: Animation Engine 0.3
 * 
 * Kodlee Yin
 * 4-19-2014
 */
var AnimateEngine = function()
{
	var RequestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
	var in_drawStart = 0,
		in_diff = 0,
		in_startTime = Date.now(),
		set_isInMotion = false;
	
	var set_animationCallback;
	
	var Animate = function()
	{
		in_drawStart = Date.now();
		in_diff = in_drawStart - in_startTime;
		
		if(Object.prototype.toString.call(set_animationCallback) == "[object Function]")
			set_animationCallback(in_diff);
		
		in_startTime = in_drawStart;
		if(set_isInMotion)
			RequestAnimationFrame(Animate);
	}
	
	this.Start = function()
	{
		set_isInMotion = true;
		in_startTime = Date.now();
		RequestAnimationFrame(Animate);
	}
	
	this.Stop = function()
	{
		set_isInMotion = false;
	}
	
	this.SetAnimation = function(pCallback)
	{
		set_animationCallback = pCallback;
	}
};