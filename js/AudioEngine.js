/**
 * Visual Music Project: Audio Engine 1.4
 * 
 * Copyleft Kodlee Yin 
 * 4-18-2014
 */
var AudioEngine = function()
{
	//Vars
	var in_audioCtx = null,
		in_audioBuffer = null,
		in_audioBufferNext = null,
		in_audioBufferSource = null,
		in_audioAnalyser = null,
		in_isLoaded = false,
		in_audioFrequencyData = null,
		in_playTimeStart = 0,
		in_playTime = 0,
		in_isPlaying = false;
	
	//Cooooonstructor
	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		in_audioCtx = new AudioContext();
	} catch(e) {
		console.log("Web Audio API is not supported on this browser.");
		return;
	}
	
	this.BufferAudioFromURL = function(pUrl, pCallback, pProg)
	{
		if(in_audioCtx == null)
		{
			console.log("Audio context has not been set");
			return;
		}
		
		var request = new XMLHttpRequest();
		request.open('GET', pUrl, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			console.log("Fetch complete.")
			console.log("Decoding audio...");
			in_audioCtx.decodeAudioData(request.response, function(pBuffer) {
				console.log("Audio decode complete.");
				in_audioBufferNext = pBuffer;
				in_isLoaded = true;
				if(Object.prototype.toString.call(pCallback) == "[object Function]")
					pCallback();
			}, function() {
				console.log("Failed to decode audio.");
			});
		};
		request.onprogress = function(e) {
			if(pProg != null && e.lengthComputable)
			{
				pProg.attr({
					"value": e.loaded / e.total * 100
				});
			}
		};
		console.log("Fetching song...");
		request.send();
	}
	this.BufferAudioFromFile = function(pFile, pCallback, pProg)
	{
		if(in_audioCtx == null)
		{
			console.log("Audio context has not been set");
			return;
		}
		
		var reader = new FileReader();
		
		reader.onprogress = function(e) {
			if(pProg != null && e.lengthComputable)
			{
				pProg.attr({
					"value": e.loaded / e.total * 100
				});
			}
		};
		reader.onload = function() {
			console.log("File loaded")
			console.log("Decoding audio...");
			try {
				in_audioCtx.decodeAudioData(reader.result, function(pBuffer) {
					console.log("Audio decode complete.");
					in_audioBufferNext = pBuffer;
					in_isLoaded = true;
					if(Object.prototype.toString.call(pCallback) == "[object Function]")
						pCallback();
				}, function() {
					console.log("Failed to decode audio.");
				});
			} catch(e) {console.log(e);}
			
		};
		
		reader.readAsArrayBuffer(pFile);
	}
	
	this.Stop = function()
	{
		console.log("Stop has been executed");
		in_playTime = 0;
		if(in_isLoaded && in_isPlaying)
		{
			in_isPlaying = false;
			try {
				in_audioBufferSource.stop(0);
			} catch(e) {
				console.log("Audio has already been stopped");
			}
		}
	}
	this.Play = function(pCompleteCallback)
	{
		console.log("Play has been executed");
		
		if(in_isPlaying)
			this.Stop();
		if(in_isLoaded && !in_isPlaying)
		{
			console.log("Getting audio buffer source");
			in_audioBufferSource = in_audioCtx.createBufferSource();
			
			console.log("Attaching new analyser to output");
			in_audioAnalyser = in_audioCtx.createAnalyser();
			in_audioAnalyser.minDecibels = -70;
			in_audioAnalyser.maxDecibels = 0;
			in_audioAnalyser.connect(in_audioCtx.destination);
			
			console.log("Setting loaded file to buffer source, then attaching to analyser");
			in_audioBufferSource.buffer = in_audioBuffer;
			in_audioBufferSource.connect(in_audioAnalyser);
			
			console.log("Starting audio");
			in_audioBufferSource.start(0, in_playTime);
			in_audioBufferSource.onended = function() {
				if(Object.prototype.toString.call(pCompleteCallback) == "[object Function]")
					pCompleteCallback();
			};
			in_playTimeStart = in_audioCtx.currentTime;
			in_isPlaying = true;

			in_audioFrequencyData = new Uint8Array(in_audioAnalyser.frequencyBinCount);
		}
	}
	this.Pause = function()
	{
		if(in_isLoaded)
		{
			var tempPlayTime = in_playTime;
			this.Stop();
			in_playTime = tempPlayTime + (in_audioCtx.currentTime - in_playTimeStart);
			console.log(in_playTime);
		}
	}
	this.PlayNext = function(pCompleteCallback)
	{
		in_audioBuffer = in_audioBufferNext;
		this.Play(pCompleteCallback);
	}
	
	this.GetByteFrequencyData = function()
	{
		if(in_audioAnalyser == null)
			return new Array(1);
		
		in_audioAnalyser.getByteFrequencyData(in_audioFrequencyData);
		return in_audioFrequencyData;
	}
	
	this.GetPlayTime = function() 
	{
		if(in_isPlaying)
			return in_playTime + (in_audioCtx.currentTime - in_playTimeStart);
		else
			return in_playTime;
	}
};