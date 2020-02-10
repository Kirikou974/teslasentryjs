const express = require('express');
const path = require('path');
const common = require('../common');
const router = express.Router();

//Generates poster image for video
router.get('/:cliptype/:id/:side/poster.jpg', (req, res) => {
	let videoType = req.params.cliptype;
	let videoId = req.params.id;
	let videoSide = req.params.side;
	let videoPath = common.getVideoPath(
		common.eventsFolderName,
		videoType,
		videoId
	);
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
	let videoPath = common.getVideoPath(
		common.eventsFolderName,
		videoType,
		videoId
	);
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
router.delete('/:cliptype/:clipday/:id', (req, res) => {
	let videoPath = common.getVideoPath(
		common.eventsFolderName,
		req.params.cliptype,
		req.params.id
	);
	common
		.deleteVideo(videoPath)
		.then(() => {
			common.getAllEvents().then(events => {
				let nextClip = {};
				if (events) {
					if (
						events[req.params.cliptype] &&
						events[req.params.cliptype].items &&
						Object.entries(events[req.params.cliptype].items).length > 0
					) {
						//move to next event in the same day
						nextClip.clipType = req.params.cliptype;
						if (events[req.params.cliptype].items[req.params.clipday]) {
							nextClip.clipDay = req.params.clipday;
							nextClip.clipFolder =
								events[req.params.cliptype].items[
									req.params.clipday
								].events[0].folderName;
						}
						//move to next day in the clip type
						else {
							let currentClipTypeItems = events[req.params.cliptype].items;
							let firstDay = Object.keys(currentClipTypeItems)[0];
							nextClip.clipDay = firstDay;
							nextClip.clipFolder =
								currentClipTypeItems[firstDay].events[0].folderName;
						}
					}
					//move to first day in other clip type
					else {
						let clipTypes = Object.keys(events);
						let otherClipType;
						clipTypes.forEach(clipType => {
							if (clipType != req.params.cliptype) {
								otherClipType = clipType;
							}
						});
						if (Object.entries(events[otherClipType].items).length > 0) {
							let firstDay = Object.keys(events[otherClipType].items)[0];
							nextClip.clipType = otherClipType;
							nextClip.clipDay = firstDay;
							nextClip.clipFolder =
								events[otherClipType].items[firstDay].events[0].folderName;
						}
					}
				}
				res.json(nextClip);
			});
		})
		.catch(error => {
			res.json(error);
		});
});

module.exports = router;
