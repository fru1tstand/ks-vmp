<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<title>The Visual Music Project - KodleeShare</title>

		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.js"></script>
		<script src="js/AudioPlayer.js"></script>
		<script src="js/VMPShared.js"></script>
		<script>
			


// 			var clearTheme = function() {
// 				destroy(function() {document.getElementById("body").innerHTML = "";});
// 			};
// 			var loadTheme = function() {
// 				var a = new XMLHttpRequest();
// 				a.open("get", "minimalist.php", true);
// 				a.onload = function() {
// 					//document.getElementById("body").innerHTML = a.response;
// 					insertAndExecute("body", a.response);
					
// 				};
// 				a.send();
// 			};
			$(function() {
				$('body').load('themes/minimalist.php');
			});

			var onloadReplaceAndEval = function(a) {
				document.getElementById('body').innerHTML = a.response;
				var elems = document.getElementById("body").getElementsByTagName("script");
				console.log(elems);
				for(var i = 0; i < elems.length; i++) {
					console.log(elems[i].innerHTML);
					
					window.eval(elems[i].innerHTML);
					
				}
				
				//insertAndExecute("body", a.response);
				
				//var ph = document.getElementById('placeholder');
				//ph.parentNode.replaceChild(a.response,ph);
			};
			var replaceBodyAndEvalScripts = function() {
				var a = new XMLHttpRequest();
				a.open("get", "themes/minimalist.php", true);
				a.onload = function() {
					onloadReplaceAndEval(a);
				};
				a.send();
			};
			//window.onload = replaceBodyAndEvalScripts;
		</script>
	</head>
	
	<body>

	</body>
	
	
</html>