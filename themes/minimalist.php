<style type="text/css">
	html, body {
		padding: 0;
		margin: 0;
		height: 100%;
		color: #FFF;
		font-family: "Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
	}

	#background {
		position: absolute;
		top:0;
		right:0;
		bottom:0;
		left:0;
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
		display: inline-block;
		width: .75%;
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
		display:inline-block;
		width: 0px;
		margin: 0;
		padding: 0;
		vertical-align:bottom;
		height: 100%;
	}
	
	.signature {
		max-width: 1024px;
		width: 96%;
		margin:0px auto 15px;
	}
	#time_string {
		color:#FFF;
	}
	
	#timebar {
		background-color: transparent;
		text-align: left;
		width: 100%;
		padding: 0;
		border:none;
		margin:0;
		border-left: 1px solid #FFF;
		border-right: 1px solid #FFF;
	}
	#timebar_current {
		height: 6px;
		border-bottom: 1px solid #FFF;
		width: 20%;
		display:inline-block;
		margin: 0;
		padding: 0;
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
		<div id="timebar"><div id="timebar_current"></div></div>
		<div id="time_string"></div>
	</div>
	
	<div id="controls">
		<button id="button_play" class="music_control">Play</button>
		<button id="button_stop" class="music_control">Stop</button>
		<button id="button_pause" class="music_control">Pause</button>
		<span id="fps" style="color:#FFF"></span>
		<div>
			<input type="file" id="input_songs" webkitdirectory multiple>
		</div>
	</div>
</div>

<script src="/visualmusicproject/js/Spectrum.js"></script>
<script src="/visualmusicproject/js/AnimateUpdate.js"></script>
<script src="/visualmusicproject/js/Playlist.js"></script>
<script>
	var mPlaylist = new Playlist();
	document.getElementById('input_songs').onchange = function() {
 		mPlaylist.add(this.files);
	};
	
	document.getElementById('button_stop').onclick = function() {
		system.audioPlayer.stop(true);
	};
	document.getElementById('button_play').onclick = function() {
		mPlaylist.play(system.audioPlayer);
	};
	document.getElementById('button_pause').onclick = function() {
		system.audioPlayer.pause();
	};

	var vis = new Spectrum("freq_", 128, "squared");
	var AnimateUpdate = new AnimateUpdate();
	var fpsCounter = document.getElementById("fps");
	var timer = document.getElementById("time_string");
	var cPlayTime = 0;
	var timebar = document.getElementById("timebar_current");
	
	AnimateUpdate.setCallback(function(pDiff) {
		vis.update(system.audioPlayer.getFrequencyData());
		fpsCounter.innerHTML = (1 / pDiff * 1000 + " ups");
		cPlayTime = system.audioPlayer.getPlayTime();
		timer.innerHTML = (Math.floor(cPlayTime/60) + ":" + ((cPlayTime % 60 < 10) ? "0" : "") + Math.floor(cPlayTime % 60));
		timebar.style.width = cPlayTime / system.audioPlayer.getCurrentAudioLength() * 100 + "%";
	});
	AnimateUpdate.start();

	function destroy(p_callback) {
		AnimateUpdate.stop();
		delete mPlaylist;
		delete vis;
		delete AnimateUpdate;
		delete fpsCounter;
		delete timer;
		
		if(system.isMethod(p_callback))
			p_callback();
	};

	system.addMessage(system.audioPlayer);
</script>