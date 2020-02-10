const fs = require('fs');
const { promisify } = require('util');
const readdirAsync = promisify(fs.readdir);
const accessAsync = promisify(fs.access);
const unlinkAsync = promisify(fs.unlink);
const { exec } = require('child_process');

const clipTypes = {
	SENTRY: {
		folderName: 'SentryClips',
		menuTitle: 'Sentry clips',
		menuIcon: 'eye'
	},
	SAVED: {
		folderName: 'SavedClips',
		menuTitle: 'Saved clips',
		menuIcon: 'video'
	}
};

var exports = (module.exports = {});

function checkFolder(folder) {
	return !folder.name.startsWith('.') && folder.isDirectory();
}

async function getFolderList(subFolderName) {
	let folders = await readdirAsync(`events/${subFolderName}`, {
		withFileTypes: true
	});
	let filteredFolders = folders.filter(checkFolder);
	let results = [];
	filteredFolders.forEach(folder => {
		results.push(folder.name);
	});
	return results;
}

async function getClips(clipType) {
	//Rebuild date from folder name
	let folders = await getFolderList(clipType.folderName);
	let eventDates = {};
	eventDates.menuTitle = clipType.menuTitle;
	eventDates.folderName = clipType.folderName;
	eventDates.menuIcon = clipType.menuIcon;
	eventDates.items = {};

	folders.forEach(folder => {
		let folderNameArray = folder.split('_');
		let folderTime = folderNameArray[1].replace(/-/gi, ':');
		let folderShortDate = new Date(folderNameArray[0]);
		let folderShortDateTime = folderShortDate.getTime();
		let folderDate = new Date(
			`${folderShortDate.toLocaleDateString()} ${folderTime}`
		);

		let event = {
			time: folderDate.getTime(),
			folderName: folder
		};

		if (eventDates.items[folderShortDateTime] == undefined) {
			eventDates.items[folderShortDateTime] = {};
			eventDates.items[folderShortDateTime].events = [];
			eventDates.items[folderShortDateTime].time = folderShortDateTime;
		}
		eventDates.items[folderShortDateTime].events.push(event);
	});
	return eventDates;
}
exports.deleteVideo = async videoPath => {
	try {
		await unlinkAsync(videoPath);
		console.log('unlink OK');
	} catch (error) {
		throw error;
	}
};
exports.getVideoPoster = async (videoPath, videoSide) => {
	let exportImagePath = `${videoPath}/${videoSide}.jpg`;
	try {
		await accessAsync(exportImagePath, fs.F_OK);
		return exportImagePath;
	} catch (error) {
		if (error.errno == -2) {
			return new Promise((resolve, reject) => {
				exec(
					`ffmpeg -i ${videoPath}/${videoSide}.mp4 -r 1 -an -vframes 1 -f mjpeg ${exportImagePath}`,
					(error, stdout, stderr) => {
						if (error) {
							reject(error);
						} else {
							resolve(exportImagePath);
						}
					}
				);
			});
		} else {
			throw error;
		}
	}
};

exports.getAllEvents = async () => {
	let events = {};
	events.sentryEvents = await getClips(clipTypes.SENTRY);
	events.savedEvents = await getClips(clipTypes.SAVED);
	return events;
};

exports.streamVideo = (req, res, path) => {
	let stat = fs.statSync(path);
	let total = stat.size;

	const range = req.headers.range;

	if (!range) {
		// 416 Wrong range
		return res.sendStatus(416);
	}
	let positions = range.replace(/bytes=/, '').split('-');
	let start = parseInt(positions[0], 10);
	let end = positions[1] ? parseInt(positions[1], 10) : total - 1;
	let chunksize = end - start + 1;

	res.writeHead(206, {
		'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
		'Accept-Ranges': 'bytes',
		'Content-Length': chunksize,
		'Content-Type': 'video/mp4',
		Connection: 'keep-alive'
	});

	let stream = fs
		.createReadStream(path, { start: start, end: end })
		.on('open', function() {
			stream.pipe(res);
		})
		.on('error', function(err) {
			res.end(err);
		});
};

exports.getVideoPath = (eventsFolderName, videoType, videoId) => {
	let videoPath = `${eventsFolderName}/${videoType}/${videoId}`;
	return videoPath;
};

exports.getVideo = async (videoPath, videoSide) => {
	let fullExportVideoPath = `${videoPath}/${videoSide}`;

	try {
		await accessAsync(`${fullExportVideoPath}.mp4`, fs.F_OK);
		return `${fullExportVideoPath}.mp4`;
	} catch (error) {
		if (error.errno == -2) {
			return new Promise((resolve, reject) => {
				exec(
					//https://unix.stackexchange.com/questions/239772/bash-iterate-file-list-except-when-empty
					//In bash, you can set the nullglob option so that a pattern that matches nothing "disappears",
					//rather than treated as a literal string
					`shopt -s nullglob;` +
						`for f in ${videoPath}/*-${videoSide}.mp4; do echo "file '$PWD/$f'";` +
						`done > ${fullExportVideoPath}.txt;` +
						`ffmpeg -f concat -safe 0 -i ${fullExportVideoPath}.txt -c copy ${fullExportVideoPath}.mp4;` +
						`rm ${videoPath}/*-${videoSide}.mp4`,
					(error, stdout, stderr) => {
						if (error) {
							reject(error);
						} else {
							resolve(`${fullExportVideoPath}.mp4`);
						}
					}
				);
			});
		}
	}
};
