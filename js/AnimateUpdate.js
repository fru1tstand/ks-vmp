/**
 * Visual Music Project: Animate Update 3.0
 * 
 * Kodlee Yin
 * 5-9-14
 */

(function(window, document, undefined) {
	var AnimateUpdate = function() {
		var self = this;
		
		//Internal Object Vars
		this.fields = {
			drawStart: 0,
			drawDiff: 0,
			startTime: 0,
			
			updateDeltaSize: 20,
			updateDeltaArray: null,
			updateDeltaPointer: 0,
			skipCalcFrames: 10,		//How many frames do you want to buffer before calculating the FPS again
			skipCalcFramesCount: 0,
			fps: 1
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
				
				if(self.state.trackUpdateDelta) {
					self.fields.skipCalcFramesCount++;
					self.fields.updateDeltaArray[self.fields.updateDeltaPointer] = self.fields.drawDiff;
					self.fields.updateDeltaPointer = ++self.fields.updateDeltaPointer % self.fields.updateDeltaSize;
					
					if(self.fields.skipCalcFramesCount >= self.fields.skipCalcFrames) {
						self.fields.skipCalcFramesCount = 0;
						self.fields.fps = 0;
						for(var i = 0; i < self.fields.updateDeltaArray.length; i++)
							self.fields.fps += self.fields.updateDeltaArray[i];
						self.fields.fps /= self.fields.updateDeltaArray.length;
						self.fields.fps = 1 / self.fields.fps * 1000;
					}
				}
				
				self.fields.startTime = self.fields.drawStart;
				if(self.state.isUpdating)
					window.requestAnimationFrame(self.internal.animate);
			}
		};
		
		this.state = {
			isUpdating: false,
			trackUpdateDelta: true
		};
		
		//*********************************************************************************** Construct
		window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
		if(!system.isMethod(window.requestAnimationFrame))
			return system.addError("Your browser doesn't support calling animation frames");
		
		//FPS track
		this.fields.updateDeltaArray = new Array(this.fields.updateDeltaSize);
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
			},
			
			//*********************************************************************************** Controls
			getFPS: function() {
				return this.fields.fps;
			}
	};
	
	window.AnimateUpdate = AnimateUpdate;
})(this, document);
