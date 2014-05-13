/**
 * Visual Music Project: Playlist 1.0
 * 
 * Kodlee Yin
 * 5-10-14
 */
var Playlist = function() {
	var self = this;
	this.fields = {
		playlist: new Array(),
		playedList: new Array(),
		playNextIndex: -1
	};
	
	this.internals = {
		validateFileExtention: function(p_name) {
			var ext = p_name.substring(p_name.length -3).toLowerCase();
			return (ext == "mp3" || ext == "wav" || ext == "ogg" || ext == "webm" || ext == "aac" || ext == "mp4");
		},
		playPlaylist: function(p_ignorePlaying) {
			if(self.fields.playlist.length < 1)
				return system.addError("There are no audio files currently loaded in the playlist");
			
			if(p_ignorePlaying == null)
				p_ignorePlaying = false;
			
			if(!p_ignorePlaying && system.audioPlayer.isPlaying())
				system.audioPlayer.stop(false);
			
			if(!system.audioPlayer.isAudioReady() && !system.audioPlayer.isAudioQueueReady()) {			// Current: False	Next: False
				if(!self.state.isQueueActive)
					self.internals.queueAudio(self.internals.playPlaylist);
			} else if(!system.audioPlayer.isAudioReady() && system.audioPlayer.isAudioQueueReady()) {	// Current: False	Next: True
				system.audioPlayer.playNext(self.playNextPlaylist);
				if(!self.state.isQueueActive)
					self.internals.queueAudio();
			} else if(system.audioPlayer.isAudioReady() && !system.audioPlayer.isAudioQueueReady()) {	// Current: True	Next: False
				if(!system.audioPlayer.isPlaying())
					system.audioPlayer.play(self.internals.playNextPlaylist);
				if(!self.state.isQueueActive)
					self.internals.queueAudio();
			} else { 																		// Current: True	Next: True
				if(!system.audioPlayer.isPlaying())
					system.audioPlayer.play(self.internals.playNextPlaylist);
			}
		},
		playNextPlaylist: function(p_ignorePlaying) {
			if(self.state.isQueueActive) {
				system.addMessage("Waiting for audio to load before playing");
				self.state.playNextCalled = true;
			} else {
				system.audioPlayer.clearCurrentBuffer();
				self.internals.playPlaylist();
			}
		},
		indexNextSong: function() {
			if(self.state.repeat == 2)
				return true;
			
			self.fields.playNextIndex = ((self.state.shuffle) ? Math.round(Math.random() * self.fields.playlist.length) : (++self.fields.playNextIndex % self.fields.playlist.length));
			
			if(self.state.repeat == 0) {
				if(self.fields.playedList.length == self.fields.playlist.length)
					return false;
				
				var matchFound = false;
				do {
					matchFound = false;
					for(var i = 0; i < self.fields.playedList.length; i++) {
						if(self.fields.playNextIndex == self.fields.playedList[i]) {
							matchFound = true;
							self.fields.playNextIndex = (++self.fields.playNextIndex % self.fields.playlist.length);
							break;
						}
					}
				} while(matchFound);
			}
			
			self.fields.playedList.push(self.fields.playNextIndex);
			system.addMessage("Next audio file is " + self.fields.playlist[self.fields.playNextIndex].name + " (Indexed at " + self.fields.playNextIndex + ")");
			return true;
		},
		queueAudio: function(p_loadCompleteCallback) {
			if(!self.internals.indexNextSong())
				return system.addMessage("That's the end of this playlist");

			self.state.isQueueActive = true;
			system.audioPlayer.loadBufferFromFile(self.fields.playlist[self.fields.playNextIndex], function() {
				self.state.isQueueActive = false;
				if(self.state.playNextCalled) {
					self.state.playNextCalled = false;
					self.internals.playNextPlaylist();
				}
				if(system.isMethod(p_loadCompleteCallback))
					p_loadCompleteCallback();
			});
		}
	};
	
	this.state = {
		isQueueActive: false,
		playNextCalled: false,
		shuffle: false,
		repeat: 0				//0: none, 1: all, 2: song
	};
};

Playlist.prototype = {
	add: function(p_file) {
		if(p_file instanceof File && this.internals.validateFileExtention(p_file.name))
			this.fields.playlist.push(p_file);
		else
			system.addError("The object passed was not a file!");
	},
	play: function() {
		this.internals.playPlaylist();
	},
	setRepeat: function(p_repeat) {
		this.fields.playedList = new Array();
		
		switch(p_repeat) {
		case "none":
		case "0":
		case 0:
			this.state.repeat = 0;
			break;
		
		case "one":
		case "song":
		case "2":
		case 2:
			this.state.repeat = 2;
			break;
			
		case "all":
		case "playlist":
		case "1":
		case 1:
		default:
			this.state.repeat = 1;
			break;
		}
	}
};