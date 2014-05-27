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
				highpassCutoff: 256,	//(lowpassCutoff, 1023]
				lowpassCutoff: 0,		//[0, highpassCutoff)
				specFunction: null,
				
				//Dom elements
				domHeightMax: 500,
				domArray: null,
				samplePoints: null,
				domIdPrefix: "",
				
				//Others
				onUpdateEvent: {
					self: this,
					freqData: null
				}
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
							return (1023 - self.fields.highpassCutoff) / self.fields.samplePoints.length * x;
						};
					}
					var valMax = i_function(self.fields.samplePoints.length - 1),
						valMin = i_function(0);
					var scale = (self.fields.highpassCutoff - self.fields.lowpassCutoff) / (valMax - valMin);
					
					for(var i = 0; i < self.fields.samplePoints.length; i++) {
						self.fields.samplePoints[i] = Math.round(Math.max(i_function(i) * scale, 1));
						if(i != 0 && self.fields.samplePoints[i] <= self.fields.samplePoints[i - 1])
							self.fields.samplePoints[i] = self.fields.samplePoints[i - 1] + 1;
					}
						 //Math.round(Math.min(Math.max(i_function(i), self.fields.lowpassCutoff), self.fields.highpassCutoff));
					
					system.addMessage(self.fields.samplePoints);
				}
		};
		
		//*********************************************************************************** Construct
		this.fields.domArray = new Array(p_barCount);
		this.fields.samplePoints = new Array(p_barCount);
		this.fields.specFunction = p_function;
		this.internal.setSamplePoints();
		this.fields.domIdPrefix = p_domPrefix;
	};

	Spectrum.prototype = {
			update: function(p_freqData) {
				this.fields.onUpdateEvent.freqData = p_freqData;
				if(system.isMethod(this.events.onUpdate))
					this.events.onUpdate(this.fields.onUpdateEvent);
			},
			
			//HTML binding
			createDOM: function(p_containerId) {
				var cont = document.getElementById(p_containerId);
				for(var i = 0; i < this.fields.domArray.length; i++) {
					var insert = document.createElement("div");
					insert.id = this.fields.domIdPrefix + i;
					cont.appendChild(insert);
				}
				return this;
			},
			bindToDOM: function() {
			for(var i = 0; i < this.fields.domArray.length; i++)
				this.fields.domArray[i] = document.getElementById(this.fields.domIdPrefix + i);
				return this;
			},
			
			//Spectrum control
			setHighpass: function(p_high) {
				this.fields.highpassCutoff = p_high;
				this.internal.setSamplePoints();
			},
			setLowpass: function(p_low) {
				this.fields.lowpassCutoff = p_low;
				this.internal.setSamplePoints();
			}
	};
	
	window.Spectrum = Spectrum;
})(this, document);
