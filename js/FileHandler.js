/**
 * Visual Music Project: FileHandler
 * 
 * Copyleft Kodlee Yin
 * 4-19-2014
 */

var FileHandler = function() {
	if(!window.File || !window.FileReader || !window.FileList || !window.Blobl)
	{
		console.log("The File API is not supported on this browser");
		return;
	}
};