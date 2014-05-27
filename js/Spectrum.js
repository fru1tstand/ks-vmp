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
				highpassCutoff: 512,	//(lowpassCutoff, 1023]
				lowpassCutoff: 0,		//[0, highpassCutoff)
				
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
				setSamplePoints: function(p_barCount, p_function) {
					var i_function;
					switch(p_function) {
					case "squared":
						i_function = function(x) {
							return Math.pow(0.15 * (x + 18), 2) - 7;
						};
						break;
					case "linear":
					default:
						i_function = function(x) {
							return (1023 - self.fields.highpassCutoff) / p_barCount * x;
						};
					}
					self.fields.samplePoints = new Array(p_barCount);
					for(var i = 0; i < p_barCount; i++)
						self.fields.samplePoints[i] = Math.round(Math.min(Math.max(i_function(i), self.fields.lowpassCutoff), self.fields.highpassCutoff));
				}
		};
		
		//*********************************************************************************** Construct
		this.fields.domArray = new Array(p_barCount);
		this.internal.setSamplePoints(p_barCount, p_function);
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
			}
	};
	
	window.Spectrum = Spectrum;
})(this, document);
