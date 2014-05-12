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
		errorDebug: true
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
			if(isMethod(this.events.messageEvent))
				this.events.messageEvent(p_message);
			
			if(this.fields.messageDebug)
				console.log(p_message);
			
			return 1;
		},
		addError: function(p_message) {
			if(isMethod(this.events.errorEvent))
				this.events.errorEvent(p_message);
			
			if(this.fields.errorDebug)
				console.log(p_message);
			
			return -1;
		},
		
		//*********************************************************************************** Ajaxify
		ajaxLoad: function(p_url, p_callback) {
			var request = new XMLHttpRequest();
			request.open("get", p_url, true);
			request.onload = function () {
				if(isMethod(p_callback))
					p_callback(request);
			};
			request.send();
		}
};

//Bind to window
window.system = new System();