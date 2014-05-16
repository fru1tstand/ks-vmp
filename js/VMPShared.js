/**
 * Visual Music Project: Shared and Common vars and methods
 * 
 * Kodlee Yin
 * 5-6-14
 */

//Global vars
var System = function() {
	//Singleton pattern, because we really only want one system class
	if (arguments.callee._singletonInstance)
		return arguments.callee.singletonInstance;
	arguments.callee._singletonInstance = this;
	
	this.fields = {
		messageDebug: true,
		errorDebug: true,
		
		//Them loading
		themeScriptsLoading: 0,
		themeScriptsExecuteList: new Array(),
		themeScriptsExecute: false
	};
	this.events = {
		message: null,
		error: null
	};
	
	//We'll need this later!
	this.audioPlayer = null;
	this.playlist = null;
	
	//Lets load the first theme, ever
	this.loadTheme("themes/minimalist.html");
};

System.prototype = {
		isMethod: function(p_var) {
			return (typeof(p_var) === "function");
		},
		
		//*********************************************************************************** Message handling
		addMessage: function(p_message) {
			if(this.isMethod(this.events.messageEvent))
				this.events.messageEvent(p_message);
			
			if(this.fields.messageDebug)
				console.log(p_message);
			
			return 1;
		},
		addError: function(p_message) {
			if(this.isMethod(this.events.errorEvent))
				this.events.errorEvent(p_message);
			
			if(this.fields.errorDebug)
				console.log(p_message);
			
			return -1;
		},
		
		//*********************************************************************************** Ajaxify
		ajaxLoad: function(p_url, p_callback) {
			var self = this,
				request = new XMLHttpRequest();
			request.open("get", p_url, true);
			request.onload = function () {
				if(self.isMethod(p_callback))
					p_callback(request);
			};
			request.send();
		},
		
		//*********************************************************************************** Themify
		loadTheme: function(p_location) {
			var self = this;
			//Initially load the theme page
			this.ajaxLoad(p_location, function(r) {
				document.body.innerHTML = r.response;
				//Unfortunately, we need to manually handle all of the script tags that come with it
				var scriptElems = document.body.getElementsByTagName("script");
				for(var i = 0; i < scriptElems.length; i++) {
					//Scripts with no "src" tag have the code between <script> tags, so we can just store these
					if(scriptElems[i].src == "") {
						self.fields.themeScriptsExecuteList.push(scriptElems[i].innerHTML);
					} else {
						//Here we have to ajax load the scripts with a "src" attribute, before then evaluating the other scripts
						self.fields.themeScriptsLoading++;
																//Prevents caching
						self.ajaxLoad(scriptElems[i].src + "?t=" + Date.now(), function(s) {
							self.fields.themeScriptsLoading--;
							var script = document.createElement("script");
							script.text = s.responseText;
							document.head.appendChild(script).parentNode.removeChild(script);
							
							//This makes sure that the scripts with src tag get evaluated if all other ajax script loads are completed
							if(self.fields.themeScriptsLoading == 0 && self.fields.themeScriptsExecute) {
								for(var j = 0; j < self.fields.themeScriptsExecuteList.length; j++) {
									var script = document.createElement("script");
									script.text = self.fields.themeScriptsExecuteList[j];
									document.head.appendChild(script).parentNode.removeChild(script);
									self.fields.themeScriptsExecuteList[j] = null;
								}
							}
						});
					}
				}
				//In the rare occasion othat the ajax script loads complete before the page scripts, or that there are no
				//ajax scripts in the first place, we can evaluate the page scripts here.
				if(self.fields.themeScriptsLoading == 0) {
					for(var j = 0; j < self.fields.themeScriptsExecuteList.length; j++) {
						if(self.fields.themeScriptsExecuteList[j] != null) {
							var script = document.createElement("script");
							script.text = self.fields.themeScriptsExecuteList[j];
							document.head.appendChild(script).parentNode.removeChild(script);
							self.fields.themeScriptsExecuteList[j] = null;
						}
					}
				}
				//Or set the flag that the page has finished and we're simply waiting for the ajax to complete the call
				self.fields.themeScriptsExecute = true;
			});
		},
		clearTheme: function() {
			if(this.isMethod(destroy)) {
				destroy(this.breakTheme);
			} else {
				addError("No clean destroy method was found. This might cause errors!");
				this.breakTheme();
			}
			return this;
		},
		breakTheme: function() {
			document.body.innerHTML = "";
		}
};

//Bind to window
window.system = new System();

//Create our audio engine
system.audioPlayer = new AudioPlayer();
system.playlist = new Playlist(system.audioPlayer);
