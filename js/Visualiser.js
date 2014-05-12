/**
 * Visual Music Project: Visualiser 1.1
 * 
 * Copyleft Kodlee Yin 
 * 4-18-2014
 */
var Visualiser = function(pDomPrefix, pBarCount)
{
	//vars
	var set_heightMax = 500;		//Max height in px
	
	var in_sampleRate = 0,
		in_visBarArray;
	
	//Constructor
	var in_visBarArray = new Array(pBarCount);
	for(var i = 0; i < pBarCount; i++)
		in_visBarArray[i] = document.getElementById(pDomPrefix + i);
	
	this.Setup = function(pFreqBinCount)
	{
		in_sampleRate = Math.floor((pFreqBinCount - 512) / in_visBarArray.length);
	}
	
	this.Setup(1024);

	this.Update = function(pFreqData)
	{
		for(var i = 0; i < in_visBarArray.length; i++)
		{
			in_visBarArray[i].style.height = (pFreqData[i * in_sampleRate] / 255) * set_heightMax + "px";
		}
	}
};