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
	
	//"Constant" properties
	this.audioPlayer = new AudioPlayer();
	
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
};

System.prototype = {
		isMethod: function(p_var) {
			return p_var != null && Object.prototype.toString.call(p_var) == "[object Function]";
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
			this.ajaxLoad(p_location, function(r) {
				document.body.innerHTML = r.response;
				var scriptElems = document.body.getElementsByTagName("script");
				for(var i = 0; i < scriptElems.length; i++) {
					if(scriptElems[i].src == "") {
						self.fields.themeScriptsExecuteList.push(scriptElems[i].innerHTML);
					} else {
						self.fields.themeScriptsLoading++;
						self.ajaxLoad(scriptElems[i].src, function(s) {
							eval(s.response);
							self.fields.themeScriptsLoading--;
							if(self.fields.themeScriptsLoading == 0 && self.fields.themeScriptsExecute) {
								for(var j = 0; j < self.fields.themeScriptsExecuteList.length; j++) {
									eval(self.fields.themeScriptsExecuteList[j]);
									self.fields.themeScriptsExecuteList[j] = null;
								}
							}
						});
					}
				}
				if(self.fields.themeScriptsLoading == 0) {
					for(var j = 0; j < self.fields.themeScriptsExecuteList.length; j++) {
						if(self.fields.themeScriptsExecuteList[j] != null) {
							eval(self.fields.themeScriptsExecuteList[j]);
							self.fields.themeScriptsExecuteList[j] = null;
						}
					}
				}
				self.fields.themeScriptsExecute = true;
			});
		}
};

//Bind to window
window.system = new System();