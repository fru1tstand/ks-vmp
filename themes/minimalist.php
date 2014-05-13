<style type="text/css">
	html, body {
		padding: 0;
		margin: 0;
		height: 100%;
		color: #FFF;
		font-family: "Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
	}
	.spectrum_baseline {
		display:inline-block;
		width: 0px;
		margin: 0;
		padding: 0;
	}
	#background {
		position: absolute;
		top:0;
		right:0;
		bottom:0;
		left:0;
	}
	#background {
		background-color: #000;
	}
	
	.spectrum {
		height: 500px;
		width:100%;
		margin: 30px 0 0 0;
		padding: 0;
		text-align: center;
	}
	
	.spectrum_bar {
		display:inline-block;
		width:.75%;
		background-color: transparent;
		height:0px;
		vertical-align:bottom;
		border-top: 1px solid #FFF;
		border-bottom: 1px solid #FFF;
		margin:0;
		padding: 0;
		max-width: 8px;
	}
	
	.spectrum_baseline {
		vertical-align:bottom;
		height: 100%;
	}
	
	.signature {
		max-width: 1024px;
		width: 96%;
		margin:0px auto;
	}
	#time {
		color:#FFF;
	}
	#controls {
		margin-top: 50px;
		width: 96%;
		max-width: 1024px;
		margin: 0px auto;
	}
</style>

<div id="background">
	<div class="spectrum">
		<div class="spectrum_baseline"></div>
		<?php 
			for($i = 0; $i < 128; $i++)
				echo '<div class="spectrum_bar" id="freq_', $i, '"></div>';
		?>
	</div>
	<div class="signature">
		<div id="time"></div>
	</div>
	
	<div id="controls">
		<select id="select_song">
			<option value="" style="padding-left:5px; color:#999">Select a song</option>
			<option value="music/bullet_train.wav">Bullet Train</option>
			<option value="music/gold_feat_yuna.mp3">Gold (Feat. Yuna)</option>
			<option value="music/Pantomime.mp3">Pantomime</option>
		</select>
		<progress id="load_progress" value="0" max="100" style="width:100px;"></progress>
		<button id="button_play" class="music_control">Play</button>
		<button id="button_stop" class="music_control">Stop</button>
		<button id="button_pause" class="music_control">Pause</button>
		<span id="fps" style="color:#FFF"></span>
		<div>
			<input type="file" id="input_songs" webkitdirectory multiple>
			<select id="select_local_song">
			</select>
		</div>
	</div>
</div>

<script src="/visualmusicproject/js/Spectrum.js"></script>
<script src="/visualmusicproject/js/AnimateUpdate.js"></script>
<script src="/visualmusicproject/js/Playlist.js"></script>
<script>
	var localFiles = null;
	var currentIndex = 0;
	var isShuffle = false;
	var mPlaylist = new Playlist();
	document.getElementById('input_songs').onchange = function() {
		localFiles = this.files;

		for(var i = 0; i < localFiles.length; i++)
		{
			mPlaylist.add(localFiles.item(i));
		}
	};

	
	document.getElementById('button_stop').onclick = function() {
		system.audioPlayer.stop(true);
	};
	document.getElementById('button_play').onclick = function() {
		mPlaylist.play();
	};
	document.getElementById('button_pause').onclick = function() {
		system.audioPlayer.pause();
	};

	var vis = new Spectrum("freq_", 128, "squared");
	var AnimateUpdate = new AnimateUpdate();
	var fpsCounter = document.getElementById("fps");
	var timer = document.getElementById("time");
	var cPlayTime = 0;
	
	AnimateUpdate.setCallback(function(pDiff) {
		vis.update(system.audioPlayer.getFrequencyData());
		fpsCounter.innerHTML = (1 / pDiff * 1000 + " ups");
		cPlayTime = system.audioPlayer.getPlayTime();
		timer.innerHTML = (Math.floor(cPlayTime/60) + ":" + ((cPlayTime % 60 < 10) ? "0" : "") + Math.floor(cPlayTime % 60));
	});
	AnimateUpdate.start();

	function Destroy(p_callback) {
		AnimateUpdate.stop();
		AnimateUpdate = undefined;
		if(isMethod(p_callback))
			p_callback();
	};
</script>