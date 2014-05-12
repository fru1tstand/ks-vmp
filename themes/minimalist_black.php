<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script src="js/Spectrum.js"></script>
<script src="js/AnimateUpdate.js"></script>
<script src="js/Playlist.js"></script>
<script>
	$('#select_song').change(function() {
		if($(this).val() != "")
		{
			SYSTEM_AUDIO.LoadBufferFromURL($(this).val(), function() {
				SYSTEM_AUDIO.Stop();
				SYSTEM_AUDIO.PlayNext();
			}, function(data) {
				document.getElementById('load_progress').value = data;
			});
		}
	});

	var localFiles = null;
	var currentIndex = 0;
	var isShuffle = false;
	var mPlaylist = new Playlist();
	$('#input_songs').change(function() {
		localFiles = $(this).prop("files");
		$('#select_local_song').html("");
		$('#select_local_song').append("<option value='-1'>Choose a song</option>");
		var regex = new RegExp("/[^a-zA-Z\\(\\).]/");
		for(var i = 0; i < localFiles.length; i++)
		{
			var fileName = localFiles.item(i).name;
			var ext = fileName.substring(fileName.length - 3);
			if(ext == "mp3" || ext == "wav" || ext == "mp4" || ext == "ogg")
			{
				mPlaylist.add(localFiles.item(i));
				fileName = fileName.substring(0, fileName.length - 4);
				fileName = fileName.replace(regex, "");
				$('#select_local_song').append("<option value='" + i + "'>" + fileName + "</option>");
			}
		}
	});
	$('#select_local_song').change(function() {
		if($(this).val() != "-1")
		{
			SYSTEM_AUDIO.LoadBufferFromFile(localFiles.item($(this).val()), function() {
				playNextAndLoad();
			});
		}
	});

	var playNextAndLoad = function()
	{
		SYSTEM_AUDIO.Stop();
		SYSTEM_AUDIO.PlayNext(function() {
			playNextAndLoad();
		});
		$('#select_local_song option:selected').next().prop('selected', true);
		SYSTEM_AUDIO.LoadBufferFromFile(localFiles.item($('#select_local_song').val()));

	};
	
	$('#button_stop').click(function() {
		SYSTEM_AUDIO.Stop(true);
	});
	$('#button_play').click(function() {
		mPlaylist.play();
	});
	$('#button_pause').click(function() {
		SYSTEM_AUDIO.Pause();
	});

	var vis = new Spectrum("freq_", 128, "squared");
	var AnimateUpdate = new AnimateUpdate();
	var fpsCounter = $('#fps');
	var timer = $('#time');
	var cPlayTime = 0;
	
	AnimateUpdate.SetCallback(function(pDiff) {
		vis.Update(SYSTEM_AUDIO.GetFrequencyData());
		fpsCounter.html(1 / pDiff * 1000 + " ups");
		cPlayTime = SYSTEM_AUDIO.GetPlayTime();
		timer.html(Math.floor(cPlayTime/60) + ":" + ((cPlayTime % 60 < 10) ? "0" : "") + Math.floor(cPlayTime % 60));
	});
	AnimateUpdate.Start();

	function Destroy(p_callback) {
		AnimateUpdate.Stop();
		AnimateUpdate = undefined;
		if(IsMethod(p_callback))
			p_callback();
	};
</script>

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