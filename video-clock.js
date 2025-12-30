(() => {
  const video = document.getElementById('clockVideo');
  if (!video) return;

  const playPauseBtn = document.getElementById('video-play-pause');
  const muteBtn = document.getElementById('video-mute');
  const seekBar = document.getElementById('video-seek');
  const currentTimeLabel = document.getElementById('video-current-time');
  const durationLabel = document.getElementById('video-duration');

  function formatTime(seconds) {
    const s = Math.floor(seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  video.addEventListener('loadedmetadata', () => {
    durationLabel.textContent = formatTime(video.duration || 0);
  });

  video.addEventListener('timeupdate', () => {
    if (!Number.isFinite(video.duration) || video.duration === 0) return;
    const progress = (video.currentTime / video.duration) * 100;
    seekBar.value = progress.toString();
    currentTimeLabel.textContent = formatTime(video.currentTime);
  });

  video.addEventListener('play', () => {
    playPauseBtn.textContent = '⏸ Pause';
  });

  video.addEventListener('pause', () => {
    playPauseBtn.textContent = '▶ Play';
  });

  video.addEventListener('ended', () => {
    video.currentTime = 0;
    video.play();
  });

  playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });

  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? '🔇 Unmute' : '🔈 Mute';
  });

  seekBar.addEventListener('input', () => {
    if (!Number.isFinite(video.duration) || video.duration === 0) return;
    const pct = Number(seekBar.value) / 100;
    video.currentTime = pct * video.duration;
  });

  window.addEventListener('theme:changed', () => {});
})();
