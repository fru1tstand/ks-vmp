/**
 * Visual Music Project: Playlist 1.0
 * 
 * Kodlee Yin
 * 5-10-14
 */
var Playlist = function() {

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
			if(this.fields.playlist.length < 1)
				return system.addError("There are no audio files currently loaded in the playlist");
			
			if(p_ignorePlaying == null)
				p_ignorePlaying = false;
			
			if(!p_ignorePlaying && system.audioPlayer.isPlaying())
				system.audioPlayer.Stop(false);
			
			if(!system.audioPlayer.isAudioReady() && !system.audioPlayer.isAudioQueueReady()) {			// Current: False	Next: False
				if(!this.state.isQueueActive)
					this.internals.queueAudio(this.internals.playPlaylist);
			} else if(!system.audioPlayer.isAudioReady() && system.audioPlayer.isAudioQueueReady()) {	// Current: False	Next: True
				system.audioPlayer.PlayNext(this.playNextPlaylist);
				if(!this.state.isQueueActive)
					this.internals.queueAudio();
			} else if(system.audioPlayer.isAudioReady() && !system.audioPlayer.isAudioQueueReady()) {	// Current: True	Next: False
				if(!system.audioPlayer.isPlaying())
					system.audioPlayer.play(this.internals.playNextPlaylist);
				if(!this.state.isQueueActive)
					this.internals.queueAudio();
			} else { 																		// Current: True	Next: True
				if(!system.audioPlayer.isPlaying())
					system.audioPlayer.play(this.internals.playNextPlaylist);
			}
		},
		playNextPlaylist: function(p_ignorePlaying) {
			if(this.state.isQueueActive) {
				system.addMessage("Waiting for audio to load before playing");
				this.state.playNextCalled = true;
			} else {
				system.audioPlayer.ClearCurrentBuffer();
				this.internals.playPlaylist();
			}
		},
		indexNextSong: function() {
			if(this.state.repeat == 2)
				return true;
			
			this.fields.playNextIndex = ((this.state.shuffle) ? Math.round(Math.random() * this.fields.playlist.length) : (++this.fields.playNextIndex % this.fields.playlist.length));
			
			if(this.state.repeat == 0) {
				if(this.fields.playedList.length == this.fields.playlist.length)
					return false;
				
				var matchFound = false;
				do {
					matchFound = false;
					for(var i = 0; i < this.playedList.length; i++) {
						if(this.fields.playNextIndex == this.playedList[i]) {
							matchFound = true;
							this.fields.playNextIndex = (++this.fields.playNextIndex % this.fields.playlist.length);
							break;
						}
					}
				} while(matchFound);
			}
			
			this.fields.playedList.push(this.fields.playNextIndex);
			system.addMessage("Next audio file is " + this.fields.playlist[this.fields.playNextIndex].name + " (Indexed at " + this.fields.playNextIndex + ")");
			return true;
		},
		queueAudio: function(p_loadCompleteCallback) {
			if(!this.internals.indexNextSong())
				return system.addMessage("That's the end of this playlist");

			this.state.isQueueActive = true;
			SYSTEM_AUDIO.LoadBufferFromFile(this.fields.playlist[this.fields.playNextIndex], function() {
				this.state.isQueueActive = false;
				if(this.state.playNextCalled) {
					this.state.playNextCalled = false;
					this.internals.playNextPlaylist();
				}
				if(isMethod(p_loadCompleteCallback))
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