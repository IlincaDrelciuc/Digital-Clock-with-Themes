(() => {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const volumeEl = document.getElementById('volume');

  let audioCtx = null;
  let masterGain = null;
  let enabled = false;

  let lastSecondPlayed = null;

  function getCSSNumber(varName, fallback) {
    const v = getComputedStyle(document.body).getPropertyValue(varName).trim();
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function ensureAudio() {
    if (audioCtx) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = (Number(volumeEl.value) / 100) * 0.25;
    masterGain.connect(audioCtx.destination);
  }

  function setEnabled(next) {
    enabled = next;
    soundBtn.setAttribute('aria-pressed', String(enabled));
    soundBtn.textContent = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';

    if (!enabled) {
      if (masterGain) masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
    } else {
      ensureAudio();
      audioCtx.resume();
      updateVolume();
    }
  }

  function updateVolume() {
    if (!audioCtx || !masterGain) return;
    const vol = (Number(volumeEl.value) / 100) * 0.25;
    masterGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.01);
  }

  function playTick() {
    if (!enabled || !audioCtx || !masterGain) return;

    const tickHz = getCSSNumber('--audio-tick-hz', 880);

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(tickHz, audioCtx.currentTime);

    const t0 = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.15, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t0);
    osc.stop(t0 + 0.07);
  }

  function playChime() {
    if (!enabled || !audioCtx || !masterGain) return;

    const baseHz = getCSSNumber('--audio-chime-hz', 660);

    const notes = [1, 1.25, 1.5];
    const start = audioCtx.currentTime;

    notes.forEach((mul, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseHz * mul, start + i * 0.14);

      const t0 = start + i * 0.14;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(t0);
      osc.stop(t0 + 0.2);
    });
  }

  window.addEventListener('clock:tick', (e) => {
    const now = e.detail?.now instanceof Date ? e.detail.now : new Date();
    const sec = now.getSeconds();

    lastSecondPlayed = sec;
    playTick();
    if (now.getMinutes() === 0 && now.getSeconds() === 0) {
      playChime();
    }
  });

  window.addEventListener('theme:changed', () => {});
  soundBtn.addEventListener('click', () => {
    ensureAudio();
    audioCtx.resume();
    setEnabled(!enabled);
  });

  volumeEl.addEventListener('input', () => {
    ensureAudio();
    updateVolume();
  });

  setEnabled(false);
})();
