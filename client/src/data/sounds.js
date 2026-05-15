
// High-quality chat notification sounds
const SEND_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3';
const RECEIVE_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';

let audioUnlocked = false;

export const unlockAudio = () => {
  if (audioUnlocked) return;
  const audio = new Audio();
  // We use a silent base64 or just try to play a real sound
  audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
  audio.play().then(() => {
    audioUnlocked = true;
    console.log('Audio unlocked');
  }).catch(() => {
    // Still locked
  });
};

export const playSendSound = () => {
  const audio = new Audio(SEND_SOUND_URL);
  audio.volume = 0.4;
  audio.play().catch(err => console.log('Audio play blocked:', err));
};

export const playReceiveSound = () => {
  const audio = new Audio(RECEIVE_SOUND_URL);
  audio.volume = 0.5;
  audio.play().catch(err => console.log('Audio play blocked:', err));
};
