const express = require('express');
const formidable = require('formidable');
const fs = require('fs-extra');
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
		let fileNameArray = file.name.split('/');
		let destinationFolder = `${__dirname}/../tmp`;

		for (let index = 0; index < fileNameArray.length - 1; index++) {
			const partName = fileNameArray[index];
			destinationFolder = `${destinationFolder}/${partName}`;
			console.log(destinationFolder);
			if (!fs.existsSync(destinationFolder)) {
				try {
					fs.mkdirSync(destinationFolder);
				} catch (error) {
					//folder exists error code -17
					if (error.errno != -17) {
						throw error;
					}
				}
			}
		}
		// file.path = `${__dirname}/../${common.eventsFolderName}/${file.name}`;
		file.path = `${__dirname}/../tmp/${file.name}`;
	});

	form.on('file', function(name, file) {
		// console.log('Uploaded ' + file.name);
	});
	res.send('OK');
});

module.exports = router;
