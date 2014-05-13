/**
 * Visual Music Project: Audio Player 3.0
 * 
 * Kodlee Yin
 * 5-9-14
 */
var AudioPlayer = function() {
	var self = this;
	//Internal Object Vars
	this.fields = {
		audio: {
			ctx: null,
			currentBuffer: null,
			nextBuffer: null,
			playSource: null,
			
			analyser: null,
			analyserData: null
		},
		
		state: {
			isCurrentBufferLoaded: false,
			isNextBufferLoaded: false,
			
			playTimeStarted: 0,
			playTimeSaved: 0,
			isPlaying: false
		}
	};
	
	this.events = {
		onEnded: null,
		
		//Bugfix for Chrome
		//Chrome bug #349543 @ https://code.google.com/p/chromium/issues/detail?id=349543
		checkOnEnded: function() {
			if(!self.fields.state.isPlaying || self.fields.audio.currentBuffer == null)
				return;
			
			if(self.getPlayTime() > self.getCurrentAudioLength()) {
				self.stop(true);
				
				if(system.isMethod(self.events.onEnded))
					self.events.onEnded();
			} else {
				setTimeout(self.events.checkOnEnded, 500);
			}
		}
	};
	
	//*********************************************************************************** Construct
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	if(window.AudioContext == null)
		return system.addError("Web Audio API is not supported on this browser.");
	
	this.fields.audio.ctx = new AudioContext();

};

AudioPlayer.prototype = {
		//*********************************************************************************** Queueing
		loadBufferFromURL: function(p_url, p_callback, p_progCallback) {
			var self = this;
			
			if(!this.isReady())
				return system.addError("Audio context has not been set");
			
			var request = new XMLHttpRequest();
			request.open('get', p_url, true);
			request.responseType = 'arraybuffer';
			request.onload = function() {
				self.fields.audio.ctx.decodeAudioData(request.response, function(p_buffer) {
					system.addMessage("Loaded!");
					self.fields.audio.nextBuffer = p_buffer;
					self.fields.state.isNextBufferLoaded = true;
					if(system.isMethod(p_callback))
						p_callback();
				}, function(e) { //Fail call
					system.addError("Failed to decode audio (" + e + ")");
				});
			};
			request.onprogress = function(e) {
				if(system.isMethod(p_progCallback) && e.lengthComputable)
					p_progCallback(e.loaded / e.total * 100);
			};
			this.fields.audio.nextBuffer = null;
			system.addMessage("Loading audio from site...");
			request.send();
		},
		loadBufferFromFile: function(p_file, p_callback, p_progCallback) {
			var self = this;
			
			if(!this.isReady())
				return system.addError("Audio context has not been set");
			
			var reader = new FileReader();
			reader.onload = function() {
				self.fields.audio.ctx.decodeAudioData(reader.result, function(p_buffer) {
					system.addMessage("Loaded!");
					self.fields.audio.nextBuffer = p_buffer;
					self.fields.state.isNextBufferLoaded = true;
					if(system.isMethod(p_callback))
						p_callback();
				}, function(e) { //Fail call
					system.addError("Failed to decode audio (" + e + ")");
				});
			};
			reader.onprogress = function(e) {
				if(system.isMethod(p_progCallback) && e.lengthComputable)
					p_progCallback(e.loaded / e.total * 100);
			};
			this.fields.audio.nextBuffer = null;
			system.addMessage("Loading audio from file...");
			reader.readAsArrayBuffer(p_file);
		},
		
		//*********************************************************************************** Playback
		stop: function(p_resetPlaytime) {
			if(!this.isReady())
				return system.addError("Sorry, your browser doesn't support Web Audio API!");
			
			if(p_resetPlaytime) 
				this.resetTime();
			
			if(this.fields.state.isPlaying) {
				try {
					this.fields.audio.playSource.stop(0);
				} catch(e) {
					system.addMessage("Audio has already been stopped");
				};
			}
			
			this.fields.state.isPlaying = false;
		},
		play: function(p_completeCallback) {
			if(!this.isReady())
				return system.addError("Sorry, your browser doesn't support Web Audio API!");
			
			if(!this.fields.state.isCurrentBufferLoaded)
				return system.addError("No audio selected");
			
			if(this.fields.state.isPlaying)
				this.Stop(true);
			if(!this.fields.state.isPlaying) {
				this.fields.audio.playSource = this.fields.audio.ctx.createBufferSource();
				
				//Chrome bug #349543 @ https://code.google.com/p/chromium/issues/detail?id=349543
				//onended does not fire on Windows
//				iv_audioPlaySource.onended = function() {
//					console.log("always will poop");
//					if(isMethod(p_completeCallback))
//						p_completeCallback();
//				};
				this.events.onEnded = p_completeCallback;
				
				this.fields.audio.analyser = this.fields.audio.ctx.createAnalyser();
				this.fields.audio.analyser.minDecibels = -70;
				this.fields.audio.analyser.maxDecibels = 0;
				this.fields.audio.analyser.connect(this.fields.audio.ctx.destination);
				
				this.fields.audio.playSource.buffer = this.fields.audio.currentBuffer;
				this.fields.audio.playSource.connect(this.fields.audio.analyser);
				
				system.addMessage("Playing audio");

				this.fields.audio.playSource.start(0, this.fields.state.playTimeSaved);
				
				this.fields.state.playTimeStarted = this.fields.audio.ctx.currentTime;
				this.fields.state.isPlaying = true;
				
				this.fields.audio.analyserData = new Uint8Array(this.fields.audio.analyser.frequencyBinCount);
				this.events.checkOnEnded();
			}
		},
		pause: function() {
			if(!this.isReady())
				return system.addError("Sorry, your browser doesn't support Web Audio API");
			
			if(!this.fields.state.isPlaying)
				return system.addError("No audio is currently playing");
			
			this.fields.state.playTimeSaved += (this.fields.audio.ctx.currentTime - this.fields.state.playTimeStarted);
			this.stop(false);
			
			system.addMessage("Paused at " + Math.floor(this.fields.state.playTimeSaved / 60) + ":" + ((this.fields.state.playTimeSaved % 60 < 10) ? "0" : "") +  (this.fields.state.playTimeSaved % 60));
		},
		playNext: function(p_completeCallback) {
			if(!this.isReady())
				return system.addError("Sorry, your browser doesn't support Web Audio API");
			
			if(!this.fields.state.isNextBufferLoaded)
				return system.addError("No audio is currently queue'd");
			
			this.fields.audio.currentBuffer = this.fields.audio.nextBuffer;
			this.fields.state.isCurrentBufferLoaded = true;
			
			this.resetTime();
			this.play(p_completeCallback);
			
			this.fields.state.isNextBufferLoaded = false;
		},
		resetTime: function() {
			this.fields.state.playTimeSaved = 0;
			this.fields.state.playTimeStarted = 0;
		},
		clearCurrentBuffer: function() {
			this.fields.state.isCurrentBufferLoaded = false;
		},
		clearNextBuffer: function() {
			this.fields.state.isNextBufferLoaded = false;
		},
		
		//*********************************************************************************** Getters
		/**
		 * Returns if web audio api is supported in the browser.
		 */
		isReady: function() {
			return (this.fields.audio.ctx != null);
		},
		getFrequencyData: function() {
			if(this.fields.audio.analyser == null)
				return new Array(1);
			
			this.fields.audio.analyser.getByteFrequencyData(this.fields.audio.analyserData);
			return this.fields.audio.analyserData;
		},
		getPlayTime: function() {
			if(this.fields.state.isPlaying)
				return this.fields.state.playTimeSaved + (this.fields.audio.ctx.currentTime - this.fields.state.playTimeStarted);
			else
				return this.fields.state.playTimeSaved;
		},
		getCurrentAudioLength: function() {
			if(this.fields.audio.currentBuffer != null)
				return this.fields.audio.currentBuffer.duration;
		},
		isAudioReady: function() {
			return this.fields.state.isCurrentBufferLoaded;
		},
		isAudioQueueReady: function() {
			return this.fields.state.isNextBufferLoaded;
		},
		isPlaying: function() {
			return this.fields.state.isPlaying;
		}
};