(function(self, undefined) {
	self.onmessage = function(event) {
		var reader = new FileReaderSync();
		var buffer = reader.readAsArrayBuffer(event.data);
		
		//Can't use audiocontext here
		
		self.postMessage(buffer);
	};
}(this));
