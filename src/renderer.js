const { ipcRenderer } = require('electron');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

document.getElementById('drop_zone').addEventListener('drop', (event) => {
	event.preventDefault();
	event.stopPropagation();

	let file = event.dataTransfer.files[0].path;

	ffmpeg.ffprobe(file, (err, metadata) => {
		if (err) {
			console.error(err);
			displayError('读取视频信息出错');
			return;
		}

		const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
		const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

		const resolution = `${videoStream.width}x${videoStream.height}`;
		const aspectRatio = (videoStream.width / videoStream.height).toFixed(3);
		const videoCodec = videoStream.codec_name;
		const videoBitrate = videoStream.bit_rate;
		const frameRate = videoStream.r_frame_rate;
		const audioCodec = audioStream?.codec_name;
		const audioBitrate = audioStream?.bit_rate;
		const duration = new Date(metadata.format.duration * 1000).toISOString().substr(11, 12);
		const bitDepth = videoStream?.bits_per_raw_sample;
		const releaseName = path.basename(file);
		const fileSize = metadata.format.size;
		const format = metadata.format.format_name;
		const aspectRatioValue = parseFloat(aspectRatio).toFixed(3);

		fs.stat(file, (err, stats) => {
			if (err) {
				console.error(err);
				displayError('读取文件属性出错');
				return;
			}

			const releaseDate = stats.birthtime.toISOString();
			updateUI({
				releaseDate,
				bitDepth,
				releaseName,
				resolution,
				aspectRatio,
				videoCodec,
				videoBitrate,
				frameRate,
				audioCodec,
				audioBitrate,
				duration,
				fileSize,
				format,
				aspectRatioValue
			});
		});
	});
});

document.getElementById('drop_zone').addEventListener('dragover', (event) => {
	event.preventDefault();
	event.stopPropagation();
});

// function updateUI(details) {
//     document.getElementById('release-date').innerText = details.releaseDate;
//     document.getElementById('bit-depth').innerText = `${details.bitDepth} 位`;
//     // 您可以继续为其他的详细信息做同样的事情，只需添加更多的占位符并在这里更新它们
//     document.getElementById('details-container').style.display = 'block';
// }

function displayError(message) {
	// 这里可以为用户显示一个错误消息，例如添加一个红色的文字提示到UI上
	alert(message); // 这只是一个简单的例子，您可以选择更友好的方式来展示错误
}

function updateUI(details) {
	const detailsText = `
RELEASE.NAME........: ${details.releaseName}
RELEASE.DATE........: ${details.releaseDate}
DURATION............: ${details.duration} (HH:MM:SS.MMM)
RELEASE.SIZE........: ${(details.fileSize / (1024 * 1024)).toFixed(2)} GiB
RELEASE.FORMAT......: ${details.format || 'MPEG-4'}
OVERALL.BITRATE.....: ${details.videoBitrate + details.audioBitrate} kb/s
RESOLUTION..........: ${details.resolution} (${details.aspectRatio})
VIDEO.CODEC.........: ${details.videoCodec} @ ${details.videoBitrate} kb/s
BIT.DEPTH...........: ${details.bitDepth} bits
FRAME.RATE..........: ${details.frameRate} FPS
Aspect.Ratio........: ${details.aspectRatioValue}
Audio #0............: ${details.audioCodec} @ ${details.audioBitrate} kb/s
SOURCE..............: WEB-DL
UPLOADER............: HDSWEB
	`;
	document.getElementById('details-container').innerText = detailsText;
	document.getElementById('details-container').style.display = 'block';
}
