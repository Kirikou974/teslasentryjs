const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const common = require('../common');
const router = express.Router();

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
router.get('/video/:cliptype/:id/poster.jpg', (req, res) => {
	let videoType = req.params.cliptype;
	let videoId = req.params.id;
	let imageFolderPath = 'public/videoimages';
	common.getPosterImage(videoId, imageFolderPath).then(imagePath => {
		res.sendFile(path.join(__dirname, `../${imagePath}`));
	});
});

router.get('/video/:cliptype/:id/:side', (req, res) => {
	let videoType = req.params.cliptype;
	let videoId = req.params.id;
	let videoSide = req.params.side;
	let videoPath = `events/${videoType}/${videoId}`;
	common.getVideoStream(videoPath, videoSide).then(() => {
		common.sendVideoStream(req, res, `${videoPath}/${videoSide}.mp4`);
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

// const assets = 'public/assets';
// const videoName = 'nature';

// app.get('/video', (req, res) => {
//     const path = `${assets}/${videoName}_output.mp4`;
//     fs.access(path, fs.F_OK, (err) => {
//         if (err) {
//             //Fix for Chrome as tesla video start with negative time :
//             // https://www.reddit.com/r/teslamotors/comments/chpbsp/2019244_dashcam_video_not_playable_in_browser/
//             //
//             exec(`ffmpeg -i ${assets}/${videoName}.mp4 -c:v copy ${assets}/${videoName}_output.mp4`, (error, stdout, stderr) => {
//                 if (error) {
//                     console.log(error);
//                     res.sendStatus(500);
//                 }
//                 else {
//                     common.streamVideo(req, res, path);
//                 }
//             });
//         }
//         else {
//             common.streamVideo(req, res, path);
//         }
//     });
// });
