const express = require('express');
const formidable = require('formidable');
const fs = require('fs-extra');
const path = require('path');
const common = require('../common');
const router = express.Router();

const form = new formidable.IncomingForm();
form.maxFileSize = 20000 * 1024 * 1024;

router.post('/upload', (req, res) => {
	form.parse(req);
	form.on('progress', function(bytesReceived, bytesExpected) {
		console.log(
			`${bytesReceived}/${bytesExpected} (${(bytesReceived / bytesExpected) *
				100} %)`
		);
	});
	form.on('fileBegin', function(name, file) {
		fs.ensureDirSync(path.dirname(file.name));
		file.path = `${__dirname}/../${file.name}`;
	});

	form.on('file', function(name, file) {
		// console.log('Uploaded ' + file.name);
	});

	form.on('end', function(name, file) {
		// Upload ended;
	});
	res.send('OK');
});

module.exports = router;
