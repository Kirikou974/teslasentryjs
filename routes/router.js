const express = require('express');
const path = require('path');
const common = require('../common');
const router = express.Router();
const eventsFolderName = 'events';
const videoImagesFolderName = 'videoimages';

router.get('*', (req, res, next) => {
	common.getAllEvents().then(events => {
		req.menuItems = events;
		next();
	});
});

router.get('/favicon.ico', (req, res, next) => {
	res.sendStatus(404);
});

router.get('/', (req, res) => {
	res.redirect('/home');
});

//Generates poster image for video
router.get('/video/:cliptype/:id/:side/poster.jpg', (req, res) => {
	let videoType = req.params.cliptype;
	let videoId = req.params.id;
	let videoSide = req.params.side;
	let videoPath = common.getVideoPath(eventsFolderName, videoType, videoId);
	common
		.getVideoPoster(videoPath, videoSide, videoImagesFolderName)
		.then(imagePath => {
			res.sendFile(path.join(__dirname, `../${imagePath}`));
		});
});

//Generates video stream and streams it
router.get('/video/:cliptype/:id/:side', (req, res) => {
	let videoType = req.params.cliptype;
	let videoId = req.params.id;
	let videoSide = req.params.side;
	let videoPath = common.getVideoPath(eventsFolderName, videoType, videoId);
	common.getVideo(videoPath, videoSide).then(fullVideoPath => {
		common.streamVideo(req, res, fullVideoPath);
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
