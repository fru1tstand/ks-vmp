/**
 * Visual Music Project: Playlist 1.0
 * 
 * Kodlee Yin
 * 5-10-14
 */
var Playlist = function() {
	//Internal vars
	var
		//Core
		iv_playlist = new Array(),
		iv_playedlist = new Array(),
		iv_playNextIndex = -1,
		iv_isQueueActive = false,
		iv_playNextCalled = false,
		
		//Playlist things
		iv_shuffle = false,
		iv_repeat = 0				//0: none, 1: all, 2: song
		;
	
	//*********************************************************************************** Internals
	var validateFileExtention = function(p_name) {
		var ext = p_name.substring(p_name.length -3).toLowerCase();
		return (ext == "mp3" || ext == "wav" || ext == "ogg" || ext == "webm" || ext == "aac" || ext == "mp4");
	};
	var playPlaylist = function(p_ignorePlaying) {
		if(iv_playlist.length < 1)
			return addError("There are no audio files currently loaded in the playlist");
		
		if(p_ignorePlaying == null)
			p_ignorePlaying = false;
		
		if(!p_ignorePlaying && SYSTEM_AUDIO.IsPlaying())
			SYSTEM_AUDIO.Stop(false);
		
		if(!SYSTEM_AUDIO.IsAudioReady() && !SYSTEM_AUDIO.IsAudioQueueReady()) {			// Current: False	Next: False
			if(!iv_isQueueActive)
				queueAudio(playPlaylist);
		} else if(!SYSTEM_AUDIO.IsAudioReady() && SYSTEM_AUDIO.IsAudioQueueReady()) {	// Current: False	Next: True
			SYSTEM_AUDIO.PlayNext(playNextPlaylist);
			if(!iv_isQueueActive)
				queueAudio();
		} else if(SYSTEM_AUDIO.IsAudioReady() && !SYSTEM_AUDIO.IsAudioQueueReady()) {	// Current: True	Next: False
			if(!SYSTEM_AUDIO.IsPlaying())
				SYSTEM_AUDIO.Play(playNextPlaylist);
			if(!iv_isQueueActive)
				queueAudio();
		} else { 																		// Current: True	Next: True
			if(!SYSTEM_AUDIO.IsPlaying())
				SYSTEM_AUDIO.Play(playNextPlaylist);
		}
	};
	var playNextPlaylist = function(p_ignorePlaying) {
		if(iv_isQueueActive) {
			addMessage("Waiting for audio to load before playing")
			iv_playNextCalled = true;
		} else {
			SYSTEM_AUDIO.ClearCurrentBuffer();
			playPlaylist();
		}
	};
	var indexNextSong = function() {
		if(iv_repeat == 2)
			return true;
		
		iv_playNextIndex = ((iv_shuffle) ? Math.round(Math.random() * iv_playlist.length) : (++iv_playNextIndex % iv_playlist.length));
		
		if(iv_repeat == 0) {
			if(iv_playedlist.length == iv_playlist.length)
				return false;
			
			var matchFound = false;
			do {
				matchFound = false;
				for(var i = 0; i < iv_playedlist.length; i++) {
					if(iv_playNextIndex == iv_playedlist[i]) {
						matchFound = true;
						iv_playNextIndex = (++iv_playNextIndex % iv_playlist.length);
						break;
					}
				}
			} while(matchFound);
		}
		
		iv_playedlist.push = iv_playNextIndex;
		addMessage("Next audio file is " + iv_playlist[iv_playNextIndex].name + " (Indexed at " + iv_playNextIndex + ")");
		return true;
	};
	var queueAudio = function(p_loadCompleteCallback) {
		if(!indexNextSong())
			return addMessage("That's the end of this playlist");

		iv_isQueueActive = true;
		SYSTEM_AUDIO.LoadBufferFromFile(iv_playlist[iv_playNextIndex], function() {
			iv_isQueueActive = false;
			if(iv_playNextCalled) {
				iv_playNextCalled = false;
				playNextPlaylist();
			}
			if(isMethod(p_loadCompleteCallback))
				p_loadCompleteCallback();
		});
	};
	
	//*********************************************************************************** Methods
	this.add = function(p_file) {
		if(p_file instanceof File && validateFileExtention(p_file.name))
			iv_playlist.push(p_file);
		else
			addError("The object passed was not a file!");
	};
	this.play = function() {
		playPlaylist();
	};
	this.setRepeat = function(p_repeat) {
		iv_repeat = p_repeat;
	};

};