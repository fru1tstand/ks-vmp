
var Spectrum = function(p_domPrefix, p_barCount, p_function) {
	//Internal Vars
	var
		//DOM settings
		iv_domHeightMax = 500,
		
		//Spectrum settings
		iv_highPassCutoff = 512,	//Max 1023
		iv_lowPassCutoff = 0,		//Min 0
		
		//
		iv_specDomArray = null,
		iv_specSamplePoints = null;
	
	//*********************************************************************************** Internals
	var setSamplePoints = function(p_barCount, p_function) {
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
				return (1024 - iv_highPassCutoff) / p_barCount * x;
			};
		}

		iv_specSamplePoints = new Array(p_barCount);
		for(var i = 0; i < p_barCount; i++)
			iv_specSamplePoints[i] = Math.round(Math.min(Math.max(i_function(i), iv_lowPassCutoff), iv_highPassCutoff));
		
		addMessage(iv_specSamplePoints);
	};
	
	
	//*********************************************************************************** Construct
	this.CONSTRUCT = function(p_domPrefix, p_barCount, p_function) {
		
		iv_specDomArray = new Array(p_barCount);
		SetSamplePoints(p_barCount, p_function);
		for(var i = 0; i < p_barCount; i++)
			iv_specDomArray[i] = document.getElementById(p_domPrefix + i);
	};
	this.CONSTRUCT(p_domPrefix, p_barCount, p_function);
	
	//*********************************************************************************** Methods
	this.update = function(p_freqData) {
		for(var i = 0; i < iv_specDomArray.length; i++)
			iv_specDomArray[i].style.height = (p_freqData[iv_specSamplePoints[i]] / 255) * iv_domHeightMax + "px";
	};
	

};