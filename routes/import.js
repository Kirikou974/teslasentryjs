const express = require('express');
const formidable = require('formidable');
const fs = require('fs-extra');
const common = require('../common');
const router = express.Router();

router.post('/upload', (req, res) => {
	const form = formidable();
	form.parse(req);
	form.on('fileBegin', function(name, file) {
		// file.path = `${__dirname}/../${common.eventsFolderName}/${file.name}`;
		let fileNameArray = file.name.split('/');
		let parentFolderName = fileNameArray[0];
		let destinationFolder = `${__dirname}/../tmp/${parentFolderName}`;
		console.log(`${__dirname}/../tmp/${file.name}`);
		fs.exists(destinationFolder).then(exists => {
			if (!exists) {
				console.log('creating folder');
				fs.mkdirSync(destinationFolder);
			}
			file.path = `${__dirname}/../tmp/${file.name}`;
		});
	});

	form.on('file', function(name, file) {
		console.log('Uploaded ' + file.name);
	});
	res.send('OK');
});

module.exports = router;
