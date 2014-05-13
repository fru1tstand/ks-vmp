
var Spectrum = function(p_domPrefix, p_barCount, p_function) {
	var self = this;
	
	this.fields = {
			//Spectrum settings
			highpassCutoff: 512,	//(lowpassCutoff, 1023]
			lowpassCutoff: 0,		//[0, highpassCutoff)
			
			//Dom elements
			domHeightMax: 500,
			domArray: null,
			samplePoints: null
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
				
				system.addMessage(self.fields.samplePoints);
			}
	};
	//*********************************************************************************** Construct
	this.fields.domArray = new Array(p_barCount);
	this.internal.setSamplePoints(p_barCount, p_function);
	for(var i = 0; i < p_barCount; i++)
		this.fields.domArray[i] = document.getElementById(p_domPrefix + i);
	
};

Spectrum.prototype = {
		update: function(p_freqData) {
			for(var i = 0; i < this.fields.domArray.length; i++)
				this.fields.domArray[i].style.height = (p_freqData[this.fields.samplePoints[i]] / 255) * this.fields.domHeightMax + "px";
		}
};