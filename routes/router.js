const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const common = require('../common');
const router = express.Router();

router.get('/', (req, res) => {
	common.getAllEvents().then(events => {
		res.render('pages/index', {
			menuItems: events
		});
	});
});
router.get('/report', (req, res) => {
	res.render('pages/index');
});

module.exports = router;

// const assets = 'public/assets';
// const videoName = 'nature';

// app.get('/', (req, res) => {

//     fs.access(assets+'/images/'+videoName+'.jpg', fs.F_OK, (err) => {
//         if (err) {
//             exec(`ffmpeg -i ${assets}/${videoName}.mp4 -ss 00:00:04.00 -r 1 -an -vframes 1 -f mjpeg ${assets}/images/${videoName}.jpg`, (error, stdout, stderr) => {
//                 if (error) {
//                     console.log(error);
//                     return;
//                 }

//                 res.render('index', {
//                     image: `/assets/images/${videoName}.jpg`
//                 });
//             });
//         }

//         if(err === null) {
//             res.render('index', {
//                 image: `/assets/images/${videoName}.jpg`
//             });
//         }
//     });
// });

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
