/**
 * Visual Music Project: Playlist 3.01
 * 
 * Kodlee Yin
 * https://github.com/fru1tstand/ks-vmp
 */

(function(window, document, undefined) {
	var Playlist = function(p_audioPlayer) {
		var self = this;
		this.fields = {
				playlist: new Array(),
				playedList: new Array(),
				playNextIndex: -1,
				audioPlayer: null
		};
		
		this.events = {
				onSongComplete: null,
				
				//html dom events
				onSongSelect: function() {
					if(!self.isReady())
						return system.addError("Playlist's onSongSelect event was fired, but Playlist has yet to be instantiated");
					
					if(self.fields.audioPlayer.isPlaying())
						self.fields.audioPlayer.stop(true);
					
					//Stage some stuff
					self.resetPlayedList();
					self.fields.audioPlayer.clearNextBuffer();
					
					self.state.playNextCalled = true;
					self.internals.queueAudio(null, {
						forceNext: this.getAttribute("data-pl-idx")
					});
				}
		};
	
		this.state = {
				isQueueActive: false,
				playNextCalled: false,
				shuffle: false,
				repeat: 0				//0: none, 1: all, 2: song
		};
	
		this.internals = {
				validateFileExtention: function(p_name) {
					var ext = p_name.substring(p_name.length -3).toLowerCase();
					return (ext == "mp3" || ext == "wav" || ext == "ogg" || ext == "webm" || ext == "aac" || ext == "mp4");
				},
				playPlaylist: function(p_ignorePlaying, p_playOptions) {
					if(self.fields.playlist.length < 1)
						return system.addError("There are no audio files currently loaded in the playlist");
					
					if(p_ignorePlaying == null)
						p_ignorePlaying = false;
					
					if(p_playOptions == null)
						p_playOptions = {};
					p_playOptions.onComplete = self.internals.playNextPlaylist;
					
					if(!p_ignorePlaying && self.fields.audioPlayer.isPlaying())
						self.fields.audioPlayer.stop(false);
					
					if(!self.fields.audioPlayer.isAudioReady() && !self.fields.audioPlayer.isAudioQueueReady()) {		// Current: False	Next: False
	
						if(!self.state.isQueueActive)
							self.internals.queueAudio(self.internals.playPlaylist);
					} else if(!self.fields.audioPlayer.isAudioReady() && self.fields.audioPlayer.isAudioQueueReady()) {	// Current: False	Next: True
						self.fields.audioPlayer.playNext(p_playOptions);
						if(!self.state.isQueueActive)
							self.internals.queueAudio();
					} else if(self.fields.audioPlayer.isAudioReady() && !self.fields.audioPlayer.isAudioQueueReady()) {	// Current: True	Next: False
						if(!self.fields.audioPlayer.isPlaying())
							self.fields.audioPlayer.play(p_playOptions);
						if(!self.state.isQueueActive)
							self.internals.queueAudio();
					} else { 																		// Current: True	Next: True
						if(!self.fields.audioPlayer.isPlaying())
							self.fields.audioPlayer.play(p_playOptions);
					}
				},
				playNextPlaylist: function(p_ignorePlaying) {
					if(self.state.isQueueActive) {
						system.addMessage("Waiting for audio to load before playing");
						self.state.playNextCalled = true;
					} else {
						self.fields.audioPlayer.clearCurrentBuffer();
						self.internals.playPlaylist();
						if(system.isMethod(self.events.onSongComplete))
							self.events.onSongComplete();
					}
				},
	
				indexNextSong: function(p_indexOptions) {
					if(self.state.repeat == 2)
						return true;
					
					if(p_indexOptions == null)
						p_indexOptions = {};
					
					if(p_indexOptions.forceNext == null || p_indexOptions.forceNext > 0 || p_indexOptions.forceNext < this.fields.playlist.length)
						self.fields.playNextIndex = ((self.state.shuffle) ? Math.round(Math.random() * self.fields.playlist.length) : (++self.fields.playNextIndex % self.fields.playlist.length));
					else
						self.fields.playNextIndex = p_indexOptions.forceNext;
					
					self.fields.playNextIndex = ((self.state.shuffle) ? Math.round(Math.random() * self.fields.playlist.length) : (++self.fields.playNextIndex % self.fields.playlist.length));
	
					if(self.state.repeat == 0) {
						if(self.isComplete())
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
					//system.addMessage(self.fields.playlist);
					//system.addMessage(self.fields.playedList);
					system.addMessage("Next audio file is " + self.fields.playlist[self.fields.playNextIndex].name + " (Indexed at " + self.fields.playNextIndex + ")");
					return true;
				},
				queueAudio: function(p_loadCompleteCallback, p_indexOptions) {
					if(!self.internals.indexNextSong(p_indexOptions))
						return system.addMessage("That's the end of this playlist");
		
					self.state.isQueueActive = true;
					self.fields.audioPlayer.loadBufferFromFile(self.fields.playlist[self.fields.playNextIndex], function() {
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
		
		//*********************************************************************************** Constructor
		if(p_audioPlayer != null && p_audioPlayer instanceof AudioPlayer)
			this.fields.audioPlayer = p_audioPlayer;
	};

	Playlist.prototype = {
			//Playlist file handling
			add: function(p_file) {
				if(p_file == null)
					return addError("Nothing was passed to add");
				
				//** File
				if(p_file instanceof File) {
					if(this.internals.validateFileExtention(p_file.name))
						this.fields.playlist.push(p_file);
					else
						system.addMessage("Couldn't add " + p_file.name + ". The file type is unsupported.");
				} 
				//** FileList
				else if (p_file instanceof FileList) {
					for(var i = 0; i < p_file.length; i++)
						this.add(p_file[i]);
				} 
				//** HTMLInputElement
				else if (p_file instanceof HTMLInputElement) {
					if(p_file.files != null && p_file.files instanceof FileList)
						this.add(p_file.files);
					else
						system.addError("The element you passed doesn't contain files");
				}
				else {
					system.addError("Couldn't add the file specified. (Type of: " + typeof p_file + ")");
				}
				if(system.isMethod(this.events.onChange))
					this.events.onChange();
			},
			remove: function(p_file) {
				if(p_file == null)
					return addError("Nothing was passed to remove");
				
				//** Number - Simply remove the index at that number
				if(typeof p_file == "number") {
					if(p_file > 0 && p_file < this.fields.playlist.length)
						this.fields.playlist.splice(p_file, 1);
				} 
				//** String - Remove all instances of the song with this string
				else if(typeof p_file == "string") {
					for(var i = this.fields.playlist.length - 1; i >= 0; i--)
						if(this.fields.playlist[i].name == p_file)
							this.fields.playlist.splice(i, 1);
				}
				//** File - Remove the file
				else if(p_file instanceof File) {
					for(var i = this.fields.playlist.length - 1; i >= 0; i--)
						if(this.fields.playlist[i] == p_file)
							this.fields.playlist.splice(i, 1);
				}
				else {
					system.addError("Couldn't remove the file specified. (Type of: " + typeof p_file + ")");
				}
			},
			removeAll: function() {
				this.fields.playlist = new Array();
			},
			
			//Play control
			play: function(p_options) {
				if(!this.isReady())
					return system.addError("Playlist was not instantiated correctly");
				
				//Basically, start over new
				if(!this.fields.audioPlayer.isPlaying() && !this.fields.audioPlayer.isAudioQueueReady() && this.isComplete() && !this.fields.audioPlayer.isPaused()) {
					this.resetPlayedList();
					this.fields.audioPlayer.clearCurrentBuffer();
					this.fields.audioPlayer.clearNextBuffer();
					this.fields.audioPlayer.resetStartTime();
				}
				
				if(this.fields.audioPlayer.isPlaying()) 
					this.fields.audioPlayer.resetStartTime();
				
				if(p_options == null)
					p_options = {};
				this.events.onSongComplete = p_options.onComplete;
				this.internals.playPlaylist(false, p_options);
			},
			next: function(p_options) {
				if(!this.isReady())
					return system.addError("Playlist was not instantiated correctly");
				
				this.internals.playNextPlaylist(false, p_options);
			},
			
			//State setting
			setRepeat: function(p_repeat) {
				this.resetPlayedList();
				
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
			},
			setShuffle: function(p_shuffle) {
				//This forces shuffle to be boolean
				this.state.shuffle = (p_shuffle) ? true : false;
			},
			resetPlayedList: function() {
				this.fields.playedList = new Array();
			},
			
			//Getters
			isComplete: function() {
				return this.fields.playedList.length == this.fields.playlist.length;
			},
			isReady: function() {
				return this.fields.audioPlayer != null && this.fields.audioPlayer instanceof AudioPlayer;
			},
			hasAudio: function() {
				return this.fields.playlist.length > 0;
			}

	};

	window.Playlist = Playlist;
})(this, document);
