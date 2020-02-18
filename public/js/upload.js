function uploadFile() {
	var files = document.getElementById('file').files;
	console.log(files);
	files.forEach(file => {
		var formdata = new FormData();
		formdata.append('file', file);
		console.log(formdata);
		var ajax = new XMLHttpRequest();
		ajax.upload.addEventListener('progress', progressHandler, false);
		ajax.addEventListener('load', completeHandler, false);
		ajax.addEventListener('error', errorHandler, false);
		ajax.addEventListener('abort', abortHandler, false);
		ajax.open('POST', '/import/upload'); // http://www.developphp.com/video/JavaScript/File-Upload-Progress-Bar-Meter-Tutorial-Ajax-PHP
		ajax.send(formdata);
	});
}

function progressHandler(event) {
	document.getElementById('loaded_n_total').innerHTML =
		'Uploaded ' + event.loaded + ' bytes of ' + event.total;
	var percent = (event.loaded / event.total) * 100;
	document.getElementById('progressBar').value = Math.round(percent);
	document.getElementById('status').innerHTML =
		Math.round(percent) + '% uploaded... please wait';
}

function completeHandler(event) {
	document.getElementById('status').innerHTML = event.target.responseText;
	document.getElementById('progressBar').value = 0; //wil clear progress bar after successful upload
}

function errorHandler(event) {
	document.getElementById('status').innerHTML = 'Upload Failed';
}

function abortHandler(event) {
	document.getElementById('status').innerHTML = 'Upload Aborted';
}
