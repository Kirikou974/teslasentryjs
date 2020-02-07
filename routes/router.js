const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const common = require('../common');
const router = express.Router();
const eventsFolderName = 'events';
const videoImagesFolderName = 'videoimages';

router.get('*', (req, res, next) => {
	common.getAllEvents().then(events => {
		req.menuItems = events;
		next();
		// res.render('pages/index', {
		// 	menuItems: events
		// });
	});
});

router.get('/', (req, res) => {
	res.redirect('/home');
});

//TODO : ffmpeg -f concat -safe 0 -i <(for f in ./*front.mp4; do echo "file '$PWD/$f'"; done) -c copy front.mp4
//Generates poster image for video
router.get('/video/:cliptype/:id/:side/poster.jpg', (req, res) => {
	let videoType = req.params.cliptype;
	let videoId = req.params.id;
	let videoSide = req.params.side;
	let videoPath = common.getVideoPath(eventsFolderName, videoType, videoId);
	common
		.getPosterImage(videoPath, videoSide, videoImagesFolderName)
		.then(imagePath => {
			res.sendFile(path.join(__dirname, `../${imagePath}`));
		});
});

router.get('/video/:cliptype/:id/:side', (req, res) => {
	let videoType = req.params.cliptype;
	let videoId = req.params.id;
	let videoSide = req.params.side;
	let videoPath = common.getVideoPath(eventsFolderName, videoType, videoId);
	common.getVideoStream(videoPath, videoSide).then(fullVideoPath => {
		common.sendVideoStream(req, res, fullVideoPath);
	});
});

router.get(['/:pageName'], (req, res) => {
	res.render('pages/index', {
		menuItems: req.menuItems,
		pageName: req.params.pageName,
		clipParams: {
			clipType: req.query.cliptype,
			clipFolder: req.query.clipfolder,
			clipDay: req.query.clipday
		}
	});
});

router.get('/report', (req, res) => {
	res.render('pages/index');
});

module.exports = router;
