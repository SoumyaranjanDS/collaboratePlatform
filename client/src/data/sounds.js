let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const unlockAudio = () => {
  try {
    const ctx = getAudioContext();
    const buffer = ctx.createBuffer(1, 1, 22050);
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.connect(ctx.destination);
    node.start(0);
    // AudioContext unlocked successfully
  } catch (err) {
    console.warn('[Sounds] AudioContext unlock failed:', err);
  }
};

export const playSendSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (err) {
    // Send sound blocked
  }
};

export const playReceiveSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(580, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);
    
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(780, now + 0.07);
    gain2.gain.setValueAtTime(0.2, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.005, now + 0.07 + 0.16);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.07 + 0.16);
  } catch (err) {
    // Receive sound blocked
  }
};

export const playCallingSound = () => {
  let intervalId = null;
  let active = true;
  
  const playTone = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(520, now);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(650, now);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 1.0);
      osc2.stop(now + 1.0);
    } catch (err) {
      // Ringtone chime blocked
    }
  };
  
  playTone();
  intervalId = setInterval(() => {
    if (active) playTone();
  }, 2000);
  
  return {
    pause: () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };
};

export const playCallIncomingSound = () => {
  return playCallingSound();
};

export const playHangupSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(240, now + 0.1);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.setValueAtTime(0.12, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    
    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {
    // Hangup sound blocked
  }
};
