const fs = require('fs');
const { promisify } = require('util');
const readdirAsync = promisify(fs.readdir);
const accessAsync = promisify(fs.access);
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
exports.getReportData = () => {
	//TODO : implement function
	return null;
};

exports.getPosterImage = async (videoId, imageFolderPath) => {
	let imagePath = `${imageFolderPath}/${videoId}.jpg`;
	try {
		await accessAsync(imagePath, fs.F_OK);
	} catch (error) {
		if (error.errno == -2) {
			await new Promise((resolve, reject) => {
				exec(
					//TODO change to dynamic variables
					`ffmpeg -i events/SavedClips/2020-01-16_09-12-36/2020-01-16_09-12-32-front_output.mp4 -r 1 -an -vframes 1 -f mjpeg ${imagePath}`,
					(error, stdout, stderr) => {
						if (error) {
							reject();
							throw error;
						} else {
							resolve();
						}
					}
				);
			});
		} else {
			throw error;
		}
	}

	return imagePath;
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
