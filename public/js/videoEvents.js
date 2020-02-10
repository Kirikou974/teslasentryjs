const skipValue = 10;
const progressSlider = '#progressSlider';

function videoPaused() {
	$('#pause').hide();
	$('#play').show();
}
function videoPlaying() {
	setPlayUI();
}
function videoPlay() {
	setPlayUI();
}
function setPlayUI() {
	$('#pause').show();
	$('#play').hide();
}

function disableSlider() {
	$(progressSlider).off('input');
}

function enableSlider() {
	$(progressSlider).on('input', changeVideoPosition);
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
}

function getVideoDuration() {
	let videoDuration = videofront.duration;
	return videoDuration;
}

function syncVideos() {
	let videoDuration = getVideoDuration();
	$('#lblTotalTime').text(timeFormat(videoDuration));
	$(progressSlider).attr('max', videoDuration);

	to = new TIMINGSRC.TimingObject({
		provider: null,
		range: [0, videoDuration]
	});
	MCorp.mediaSync(document.getElementById('videofront'), to);
	MCorp.mediaSync(document.getElementById('videoback'), to);
	MCorp.mediaSync(document.getElementById('videoleftrepeater'), to);
	MCorp.mediaSync(document.getElementById('videorightrepeater'), to);

	to.on('timeupdate', function() {
		disableSlider();
		$(progressSlider).val(to.query().position.toFixed(2));
		updateSliderColor();

		$('#lblElapsedTime').text(timeFormat(videofront.currentTime));
		enableSlider();
	});
}

function changeVideoPosition() {
	setVideoPosition(parseFloat($(progressSlider).val()));
}

function playVideo() {
	setVideoVelocity(1.0);
}

function pauseVideo() {
	setVideoVelocity(0.0);
}
function accelerateVideo() {
	//TODO: performance issues
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
	setVideoPosition(0.0);
	if (!videofront.paused) {
		pauseVideo();
	}
}

function updateSliderColor() {
	//Slider coloration : https://stackoverflow.com/questions/27153035/styling-the-html5-range-bar-left-of-thumb-right-of-thumb
	let progressSliderObject = $(progressSlider)[0];
	let currentValue = progressSliderObject.value;
	let videoDuration = getVideoDuration();
	let v = (currentValue / videoDuration + 0.01) * 100;

	progressSliderObject.style.background =
		'-moz-linear-gradient(left,  #ed1e24 0%, #ed1e24 ' +
		v +
		'%, #d3d3d3 ' +
		v +
		'%, #d3d3d3 100%)';
	progressSliderObject.style.background =
		'-webkit-gradient(linear, left top, right top, color-stop(0%,#ed1e24), color-stop(' +
		v +
		'%,#ed1e24), color-stop(' +
		v +
		'%,#d3d3d3), color-stop(100%,#d3d3d3))';
	progressSliderObject.style.background =
		'-webkit-linear-gradient(left,  #ed1e24 0%,#ed1e24 ' +
		v +
		'%,#d3d3d3 ' +
		v +
		'%,#d3d3d3 100%)';
	progressSliderObject.style.background =
		'-o-linear-gradient(left,  #ed1e24 0%,#ed1e24 ' +
		v +
		'%,#d3d3d3 ' +
		v +
		'%,#d3d3d3 100%)';
	progressSliderObject.style.background =
		'-ms-linear-gradient(left,  #ed1e24 0%,#ed1e24 ' +
		v +
		'%,#d3d3d3 ' +
		v +
		'%,#d3d3d3 100%)';
	progressSliderObject.style.background =
		'linear-gradient(to right,  #ed1e24 0%,#ed1e24 ' +
		v +
		'%,#d3d3d3 ' +
		v +
		'%,#d3d3d3 100%)';
}

//https://maqentaer.com/devopera-static-backup/http/dev.opera.com/articles/view/custom-html5-video-player-with-css3-and-jquery/index.html
function timeFormat(seconds) {
	var m =
		Math.floor(seconds / 60) < 10
			? '0' + Math.floor(seconds / 60)
			: Math.floor(seconds / 60);
	var s =
		Math.floor(seconds - m * 60) < 10
			? '0' + Math.floor(seconds - m * 60)
			: Math.floor(seconds - m * 60);
	return m + ':' + s;
}

function deleteEvent(clipType, clipFolder) {
	$.ajax({
		type: 'DELETE',
		url: `/video/${clipType}/${clipFolder}`,
		success: function() {
			window.location.replace('/eventDeleted');
		},
		error: function() {
			window.location.replace('/error');
		}
	});
}
