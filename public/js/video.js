const to = new TIMINGSRC.TimingObject({
	provider: null,
	range: [0, 100]
});
const skipValue = 15;

to.on('timeupdate', function() {
	let currentPosition = getVideoPosition();
	// $('#progress').val(currentPosition);
});

function syncVideos(action) {
	// set up video sync
	MCorp.mediaSync(document.getElementById('videofront'), to);
	MCorp.mediaSync(document.getElementById('videoback'), to);
	MCorp.mediaSync(document.getElementById('videoleftrepeater'), to);
	MCorp.mediaSync(document.getElementById('videorightrepeater'), to);
}

// Later on, after some condition has been met, set video source to the
// preloaded video URL.
function loadVideos(baseVideoUrl) {
	videofront.src = `${baseVideoUrl}/front`;
	videofront.poster = `${baseVideoUrl}/front/poster.jpg`;
	videoback.src = `${baseVideoUrl}/back`;
	videoback.poster = `${baseVideoUrl}/back/poster.jpg`;
	videoleftrepeater.src = `${baseVideoUrl}/left_repeater`;
	videoleftrepeater.poster = `${baseVideoUrl}/left_repeater/poster.jpg`;
	videorightrepeater.src = `${baseVideoUrl}/right_repeater`;
	videorightrepeater.poster = `${baseVideoUrl}/right_repeater/poster.jpg`;

	videofront.addEventListener('durationchange', loadSeekbar, false);

	syncVideos();
}

function loadSeekbar() {
	// to.range = [0, videofront.duration];
	// progress.max = videofront.duration;
}

function changeVideoPosition() {
	let currentVelocity = getVideoVelocity();

	setVideoVelocity(0.0);
	setVideoPosition(parseFloat(progress.value).toFixed(1));
	setTimeout(() => {
		setVideoVelocity(currentVelocity);
	}, 1000);
}

function togglePlayPause() {
	$('#pause').toggle(0);
	$('#play').toggle(0);
}
function playVideo() {
	togglePlayPause();
	setVideoVelocity(1.0);
}

function pauseVideo() {
	togglePlayPause();
	setVideoVelocity(0.0);
}

function accelerateVideo() {
	//TODO
}
function skipVideoForward() {
	skipVideo(skipValue);
}

function skipVideoBackward() {
	skipVideo(-skipValue);
}

function skipVideo(skipValue) {
	setVideoPosition(getVideoPosition() + skipValue);
}

function setVideoPosition(position) {
	to.update({ position: position });
}

function getVideoVelocity() {
	return to.query().velocity;
}

function getVideoPosition() {
	return to.query().position;
}

function setVideoVelocity(velocity) {
	to.update({ velocity: velocity });
}

function stopVideo() {
	setVideoPosition(100.0);
}
