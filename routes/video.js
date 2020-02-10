const express = require('express');
const common = require('../common');
const router = express.Router();
const eventsFolderName = 'events';

//Generates poster image for video
router.get('/:cliptype/:id/:side/poster.jpg', (req, res) => {
	let videoType = req.params.cliptype;
	let videoId = req.params.id;
	let videoSide = req.params.side;
	let videoPath = common.getVideoPath(eventsFolderName, videoType, videoId);
	common
		.getVideoPoster(videoPath, videoSide)
		.then(imagePath => {
			res.sendFile(path.join(__dirname, `../${imagePath}`));
		})
		.catch(error => {
			res.sendStatus(404);
		});
});

//Generates video stream and streams it
router.get('/:cliptype/:id/:side', (req, res) => {
	let videoType = req.params.cliptype;
	let videoId = req.params.id;
	let videoSide = req.params.side;
	let videoPath = common.getVideoPath(eventsFolderName, videoType, videoId);
	common
		.getVideo(videoPath, videoSide)
		.then(fullVideoPath => {
			common.streamVideo(req, res, fullVideoPath);
		})
		.catch(error => {
			res.sendStatus(404);
		});
});

//Generates video stream and streams it
router.delete('/:cliptype/:id', (req, res) => {
	let videoPath = common.getVideoPath(
		eventsFolderName,
		req.params.cliptype,
		req.params.id
	);
	console.log(`Delete ${videoPath}`);
	common
		.deleteVideo(videoPath)
		.then(() => {
			console.log('isDeleted');
			res.sendStatus(200);
		})
		.catch(error => {
			console.log(error);
			res.sendStatus(500);
		});
});

module.exports = router;