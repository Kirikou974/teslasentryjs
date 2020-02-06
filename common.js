const fs = require('fs');
const { promisify } = require('util');
const readdirAsync = promisify(fs.readdir);

const clipTypes = {
	SENTRY: 'SentryClips',
	SAVED: 'SavedClips'
};

var exports = (module.exports = {});

function checkFolder(folder) {
	return !folder.name.startsWith('.') && folder.isDirectory();
}

async function getFolderList(clipType) {
	let folders = await readdirAsync(`events/${clipType}`, {
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
	// return await getFolderList(clipType);

	let folders = await getFolderList(clipType);
	let eventDates = {};
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

		if (eventDates[folderShortDateTime] == undefined) {
			eventDates[folderShortDateTime] = {};
			eventDates[folderShortDateTime].events = [];
			eventDates[folderShortDateTime].time = folderShortDateTime;
		}
		eventDates[folderShortDateTime].events.push(event);
	});

	return eventDates;
}
exports.getReportData = () => {
	//TODO : implement function
	return null;
};

exports.getAllEvents = async () => {
	let events = {};
	events.savedEvents = await getClips(clipTypes.SAVED);
	events.sentryEvents = await getClips(clipTypes.SENTRY);
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
