/**
 * Visual Music Project: Audio Player 3.04
 * 
 * Kodlee Yin
 * https://github.com/fru1tstand/ks-vmp
 */
(function(window, document, undefined) {
	var AudioPlayer = function() {
		var self = this;
		//Internal Object Vars
		this.fields = {
				ctx: null,
				currentBuffer: null,
				nextBuffer: null,
				playSource: null,
				
				analyser: null,
				analyserData: null,
				gain: null
		};
		
		this.events = {
				onEnded: null,
				
				//Bugfix for Chrome
				//Chrome bug #349543 @ https://code.google.com/p/chromium/issues/detail?id=349543
				checkOnEnded: function() {
					if(!self.state.isPlaying || self.fields.currentBuffer == null)
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
		
		this.state = {
				isCurrentBufferLoaded: false,
				isNextBufferLoaded: false,
				
				playTimeStarted: 0,
				playTimeSaved: 0,
				isPlaying: false,
				isPaused: false
		};
		
		//*********************************************************************************** Construct
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		if(window.AudioContext == null)
			return system.addError("Web Audio API is not supported on this browser.");
		
		//This layout is mapped like so: Buffer -> Analyser -> Gain (Volume) -> Speaker
		//Create context
		this.fields.ctx = new AudioContext();
		
		//Create gain node (Volume)
		this.fields.gain = this.fields.ctx.createGain();
		this.fields.gain.connect(this.fields.ctx.destination); //Output gain to speaker
		
		//Create analyser node (FFT)
		this.fields.analyser = this.fields.ctx.createAnalyser();
		this.fields.analyserData = new Uint8Array(this.fields.analyser.frequencyBinCount);
		this.fields.analyser.minDecibels = -70;
		this.fields.analyser.maxDecibels = 0;
		this.fields.analyser.connect(this.fields.gain); //Output analyser to gain
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
					self.fields.ctx.decodeAudioData(request.response, function(p_buffer) {
						system.addMessage("Loaded!");
						self.fields.nextBuffer = p_buffer;
						self.state.isNextBufferLoaded = true;
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
				this.fields.nextBuffer = null;
				system.addMessage("Loading audio from site...");
				request.send();
			},
			loadBufferFromFile: function(p_file, p_callback) {
				var self = this;
				
				if(!this.isReady())
					return system.addError("Audio context has not been set");
				
				var worker = new Worker("js/DecodeAudioWorker.js");
				worker.onmessage = function(event) {
					self.fields.ctx.decodeAudioData(event.data, function(p_buffer) {
						system.addMessage("Loaded!");
						
						self.fields.nextBuffer = p_buffer;
						self.state.isNextBufferLoaded = true;
						if(system.isMethod(p_callback))
							p_callback();
					}, function(e) { //Fail call
						system.addError("Failed to decode audio (" + e + ")");
					});
					worker.terminate();
				};
				this.fields.nextBuffer = null;
				worker.postMessage(p_file);
			},
			
			//*********************************************************************************** Playback
			stop: function(p_resetPlaytime) {
				if(!this.isReady())
					return system.addError("Sorry, your browser doesn't support Web Audio API!");
				
				if(p_resetPlaytime) 
					this.resetStartTime();
				
				if(this.state.isPlaying) {
					try {
						this.fields.playSource.stop(0);
					} catch(e) {
						system.addMessage("Audio has already been stopped");
					};
				}
				
				this.state.isPlaying = false;
			},
			play: function(p_options) {
				if(!this.isReady())
					return system.addError("Sorry, your browser doesn't support Web Audio API!");
				
				if(!this.state.isCurrentBufferLoaded)
					return system.addError("No audio selected");
				
				if(p_options == null)
					p_options = {};
				
				if(this.state.isPlaying)
					this.stop(true);
				
				this.state.isPaused = false;
				
				if(!this.state.isPlaying) {
					this.fields.playSource = this.fields.ctx.createBufferSource();
					this.fields.playSource.connect(this.fields.analyser);
					
					//Chrome bug #349543 @ https://code.google.com/p/chromium/issues/detail?id=349543
//					iv_audioPlaySource.onended = function() {
//						if(isMethod(p_completeCallback))
//							p_completeCallback();
//					};
					
					this.events.onEnded = p_options.onComplete;
					
					this.fields.playSource.buffer = this.fields.currentBuffer;
					
					system.addMessage("Playing audio");

					if(typeof p_options.startTime == "number") {
						this.state.playTimeSaved = p_options.startTime;
						system.addMessage("Seeking to " + this.state.playTimeSaved);
					}
					this.fields.playSource.start(0, this.state.playTimeSaved); 

					
					this.state.playTimeStarted = this.fields.ctx.currentTime;
					this.state.isPlaying = true;
					
					this.events.checkOnEnded();
				}
			},
			seek: function(p_time) {
				if(!this.isAudioReady())
					return;
				
				var sTime;
				if((p_time + '').substring((p_time + '').length - 1) == "%")
					sTime = p_time.substring(0, p_time.length - 2) * this.getCurrentAudioLength();
				else
					sTime = p_time;
				
				this.play({
					startTime: sTime,
					onComplete: this.events.onEnded
				});
			},
			pause: function() {
				if(!this.isReady())
					return system.addError("Sorry, your browser doesn't support Web Audio API");
				
				if(!this.state.isPlaying)
					return system.addError("No audio is currently playing");
				
				this.state.playTimeSaved += (this.fields.ctx.currentTime - this.state.playTimeStarted);
				this.stop(false);
				this.state.isPaused = true;
				
				system.addMessage("Paused at " + Math.floor(this.state.playTimeSaved / 60) + ":" + ((this.state.playTimeSaved % 60 < 10) ? "0" : "") +  (this.state.playTimeSaved % 60));
			},
			playNext: function(p_options) {
				if(!this.isReady())
					return system.addError("Sorry, your browser doesn't support Web Audio API");
				
				if(!this.state.isNextBufferLoaded)
					return system.addError("No audio is currently queue'd");
				
				this.fields.currentBuffer = this.fields.nextBuffer;
				this.state.isCurrentBufferLoaded = true;
				
				this.resetStartTime();
				this.play(p_options);
				
				this.state.isNextBufferLoaded = false;
			},
			resetStartTime: function() {
				this.state.playTimeSaved = 0;
				this.state.playTimeStarted = 0;
			},
			clearCurrentBuffer: function() {
				this.state.isCurrentBufferLoaded = false;
			},
			clearNextBuffer: function() {
				this.state.isNextBufferLoaded = false;
			},
			setVolume: function(p_vol) {
				this.fields.gain.gain.value = p_vol;
			},
			
			//*********************************************************************************** Getters
			
			/**
			 * @returns if web audio api is supported in the browser.
			 */
			isReady: function() {
				return (this.fields.ctx != null);
			},
			/**
			 * Gets the current frequency data from the analyser
			 * @returns {Uint8Array}
			 */
			getFrequencyData: function() {
				if(this.fields.analyser == null)
					return new Array(1);
				
				this.fields.analyser.getByteFrequencyData(this.fields.analyserData);
				return this.fields.analyserData;
			},
			/**
			 * Gets current play time in seconds
			 * @returns {Number}
			 */
			getPlayTime: function() {
				if(this.state.isPlaying)
					return this.state.playTimeSaved + (this.fields.ctx.currentTime - this.state.playTimeStarted);
				else
					return this.state.playTimeSaved;
			},
			/**
			 * Gets the current length of the audio buffer in seconds, or 0 if null
			 * @returns {Number}
			 */
			getCurrentAudioLength: function() {
				if(this.fields.currentBuffer != null)
					return this.fields.currentBuffer.duration;
				else
					return 0;
			},
			/**
			 * Returns true if play can be called with no error
			 * @returns {Boolean}
			 */
			isAudioReady: function() {
				return this.state.isCurrentBufferLoaded;
			},
			/**
			 * Returns true if playNext can be called with no error
			 * @returns {Boolean}
			 */
			isAudioQueueReady: function() {
				return this.state.isNextBufferLoaded;
			},
			/**
			 * Returns true if audio is playing
			 * @returns {Boolean}
			 */
			isPlaying: function() {
				return this.state.isPlaying;
			},
			/**
			 * Returns true if audio is paused (versus stopped)
			 * @returns {Boolean}
			 */
			isPaused: function() {
				return this.state.isPaused;
			}
	};
	
	window.AudioPlayer = AudioPlayer;
})(this, document);
