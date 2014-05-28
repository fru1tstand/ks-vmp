/**
 * Visual Music Project: Spectrum 2.01
 * 
 * Kodlee Yin
 * https://github.com/fru1tstand/ks-vmp
 */
(function(window, document, undefined) {
	var Spectrum = function(p_domPrefix, p_barCount, p_function) {
		var self = this;
		
		this.fields = {
				//Spectrum settings
				highpassCutoff: 255,	//(lowpassCutoff, 1023]
				lowpassCutoff: 0,		//[0, highpassCutoff)
				specFunction: null,
				
				//Dom elements
				domHeightMax: 500,
				samplePoints: null,
				samplePointsData: null
		};
		
		this.events = {
				onUpdate: null
		};
		
		this.internal = {
				setSamplePoints: function() {
					var i_function;
					switch(self.fields.specFunction) {
					case "squared":
						i_function = function(x) {
							return Math.pow(x, 2);
						};
						break;
					case "linear":
					default:
						i_function = function(x) {
							return (1023 - self.fields.highpassCutoff) / self.fields.samplePoints.length * x - 1;
						};
					}
					var valMax = i_function(self.fields.samplePoints.length - 1),
						valMin = i_function(0);
					var scale = (self.fields.highpassCutoff - self.fields.lowpassCutoff) / (valMax - valMin);
					
					for(var i = 0; i < self.fields.samplePoints.length; i++) {
						self.fields.samplePoints[i] = Math.round(Math.max(i_function(i) * scale, 1));
						if(i != 0 && self.fields.samplePoints[i] <= self.fields.samplePoints[i - 1])
							self.fields.samplePoints[i] = self.fields.samplePoints[i - 1] + 1;
						
						self.fields.samplePoints[i] = Math.min(Math.max(self.fields.samplePoints[i], self.fields.lowpassCutoff), self.fields.highpassCutoff);
					}
						 //Math.round(Math.min(Math.max(i_function(i), self.fields.lowpassCutoff), self.fields.highpassCutoff));
					
					system.addMessage(self.fields.samplePoints);
				}
		};
		
		//*********************************************************************************** Construct
		this.fields.samplePoints = new Array(p_barCount);
		this.fields.samplePointsData = new Array(p_barCount);
		this.fields.specFunction = p_function;
		this.internal.setSamplePoints();
		
		//Internal counter that never is garbaged collected
		this.i = 0;
	};

	Spectrum.prototype = {
			update: function(p_freqData) {
				for(this.i = 0; this.i < this.fields.samplePoints.length; this.i++)
					this.fields.samplePointsData[this.i] = p_freqData[this.i];
				
				if(system.isMethod(this.events.onUpdate))
					this.events.onUpdate(this.fields.samplePointsData);
			},
			
			//Spectrum control
			setHighpass: function(p_high) {
				this.fields.highpassCutoff = p_high;
				this.internal.setSamplePoints();
			},
			setLowpass: function(p_low) {
				this.fields.lowpassCutoff = p_low;
				this.internal.setSamplePoints();
			},
			setAnimation: function(p_anim) {
				this.events.onUpdate = p_anim;
			}
	};
	
	window.Spectrum = Spectrum;
})(this, document);
