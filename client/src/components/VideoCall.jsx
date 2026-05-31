import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, Monitor, SwitchCamera } from 'lucide-react';
import toast from 'react-hot-toast';
import { playCallingSound, playHangupSound } from '../data/sounds';

const isMobileDevice = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const VideoCall = ({ socket, currentUser, peerUser, isCaller, incomingOffer, onCallEnded, bufferedCandidates = [] }) => {
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callState, setCallState] = useState('connecting');
  const [facingMode, setFacingMode] = useState('user');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMobile] = useState(isMobileDevice);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const screenStreamRef = useRef(null);
  const callingAudioRef = useRef(null);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: [
          'turn:free.expressturn.com:3478?transport=udp',
          'turn:free.expressturn.com:3478?transport=tcp',
          'turns:free.expressturn.com:3478?transport=tcp'
        ],
        username: '000000002095261722',
        credential: 'wAC6QhCoSu0jPqxKYpun82d09z4='
      }
    ]
  };

  // Build video constraints based on device
  const getVideoConstraints = (facing = 'user') => {
    if (isMobile) {
      return {
        facingMode: facing,
        width: { ideal: 720 },
        height: { ideal: 1280 },
        aspectRatio: { ideal: 9 / 16 }
      };
    }
    return {
      facingMode: facing,
      width: { ideal: 1280 },
      height: { ideal: 720 },
      aspectRatio: { ideal: 16 / 9 }
    };
  };

  useEffect(() => {
    let isMounted = true;
    let stream;

    const initializeCall = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: getVideoConstraints(facingMode),
          audio: true
        });
        if (!isMounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        stream = mediaStream;
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(configuration);
        pcRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (!isMounted) return;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallState('connected');
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && isMounted) {
            socket.emit('ice-candidate', { to: peerUser, candidate: event.candidate });
          }
        };

        pc.onconnectionstatechange = () => {
          if (!isMounted) return;
          if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
            toast.error(`Connection lost with @${peerUser}`);
            cleanupCall();
          }
        };

        if (isCaller) {
          callingAudioRef.current = playCallingSound();
          const offer = await pc.createOffer();
          if (!isMounted) {
            callingAudioRef.current?.pause();
            pc.close();
            return;
          }
          await pc.setLocalDescription(offer);
          socket.emit('call-user', { to: peerUser, offer });
        } else if (incomingOffer && pc.signalingState === 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
          const answer = await pc.createAnswer();
          if (!isMounted) { pc.close(); return; }
          await pc.setLocalDescription(answer);
          socket.emit('call-accepted', { to: peerUser, answer });
          
          // Apply any ICE candidates that were received while the phone was ringing
          if (bufferedCandidates && bufferedCandidates.length > 0) {
            // Applying buffered candidates
            for (const candidate of bufferedCandidates) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (e) {
                console.error('Error adding buffered ICE candidate:', e);
              }
            }
          }
        }

        if (!isMounted) {
          callingAudioRef.current?.pause();
          pc.close();
          return;
        }

        const queuedIceCandidates = [];
        let isSettingDescription = false;

        socket.on('call-accepted', async ({ answer }) => {
          if (!isMounted) return;
          if (callingAudioRef.current) {
            callingAudioRef.current.pause();
            callingAudioRef.current = null;
          }
          if (pcRef.current && pcRef.current.signalingState === 'have-local-offer' && !isSettingDescription) {
            isSettingDescription = true;
            try {
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
              setCallState('connected');
              while (queuedIceCandidates.length > 0) {
                const candidate = queuedIceCandidates.shift();
                try { await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); }
                catch (e) { console.error('ICE candidate error:', e); }
              }
            } catch (err) {
              console.error('Error setting remote description:', err);
            } finally {
              isSettingDescription = false;
            }
          }
        });

        socket.on('ice-candidate', async ({ candidate }) => {
          if (!isMounted || !pcRef.current) return;
          try {
            if (pcRef.current.remoteDescription?.type) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              queuedIceCandidates.push(candidate);
            }
          } catch (err) { console.error('ICE error:', err); }
        });

        socket.on('call-rejected', () => {
          if (!isMounted) return;
          toast.error(`@${peerUser} rejected the call`);
          cleanupCall();
        });

        socket.on('end-call', () => {
          if (!isMounted) return;
          toast.success(`Call ended by @${peerUser}`);
          cleanupCall();
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Media device error:', err);
        toast.error('Could not start media stream. Check camera/mic permissions.');
        cleanupCall();
      }
    };

    const timer = setTimeout(initializeCall, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      callingAudioRef.current?.pause();
      socket.off('call-accepted');
      socket.off('ice-candidate');
      socket.off('call-rejected');
      socket.off('end-call');
      stream?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
    };
  }, [peerUser, isCaller, incomingOffer, socket]);

  const toggleMute = () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const toggleCameraFacing = async () => {
    if (isScreenSharing) { toast.error('Cannot switch camera while screen sharing'); return; }
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: getVideoConstraints(nextMode),
        audio: !isMuted
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      const videoSender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (videoSender) await videoSender.replaceTrack(newVideoTrack);
      localStream?.getVideoTracks().forEach(t => t.stop());
      const merged = new MediaStream([newVideoTrack, ...(localStream?.getAudioTracks() || [])]);
      setLocalStream(merged);
      if (localVideoRef.current) localVideoRef.current.srcObject = merged;
      setFacingMode(nextMode);
      setIsVideoOff(false);
      toast.success(`Switched to ${nextMode === 'user' ? 'front' : 'rear'} camera`);
    } catch (err) {
      console.error('Camera switch error:', err);
      toast.error('Failed to switch camera');
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) { stopScreenShare(); return; }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];
      const videoSender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (videoSender) await videoSender.replaceTrack(screenTrack);
      screenTrack.onended = stopScreenShare;
      const merged = new MediaStream([screenTrack, ...(localStream?.getAudioTracks() || [])]);
      if (localVideoRef.current) localVideoRef.current.srcObject = merged;
      setIsScreenSharing(true);
      toast.success('Screen sharing started');
    } catch (err) {
      console.error('Screen share error:', err);
      toast.error('Could not start screen sharing');
    }
  };

  const stopScreenShare = async () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: getVideoConstraints(facingMode),
        audio: !isMuted
      });
      const cameraTrack = cameraStream.getVideoTracks()[0];
      const videoSender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (videoSender) await videoSender.replaceTrack(cameraTrack);
      localStream?.getVideoTracks().forEach(t => t.stop());
      const merged = new MediaStream([cameraTrack, ...(localStream?.getAudioTracks() || [])]);
      setLocalStream(merged);
      if (localVideoRef.current) localVideoRef.current.srcObject = merged;
      setIsScreenSharing(false);
      setIsVideoOff(false);
      toast.success('Camera restored');
    } catch (err) {
      console.error('Stop screen share error:', err);
      setIsScreenSharing(false);
    }
  };

  const cleanupCall = () => {
    setCallState('ended');
    playHangupSound();
    if (callingAudioRef.current) { callingAudioRef.current.pause(); callingAudioRef.current = null; }
    localStream?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    onCallEnded();
  };

  const handleEndCall = () => {
    socket.emit('end-call', { to: peerUser });
    cleanupCall();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden font-sans" style={{ touchAction: 'none' }}>

      {/* ── Main Video Area ── */}
      <div className="absolute inset-0 bg-black">
        {/* Remote video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`absolute inset-0 w-full h-full ${isMobile ? 'object-cover' : 'object-contain'}`}
        />

        {/* Connecting overlay */}
        {callState === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md gap-4 z-10 transition-all duration-500">
            <Loader2 className="animate-spin text-[var(--color-accent-primary)]" size={48} />
            <span className="text-white/80 text-sm font-medium tracking-wide">Securing connection to @{peerUser}...</span>
          </div>
        )}

        {/* ── Header Pill ── */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl z-30 flex flex-col items-center transition-all animate-slide-down">
          <h2 className="text-[13px] font-bold text-white tracking-wide flex items-center gap-2">
            <Video size={14} className="text-[var(--color-accent-primary)]" /> {peerUser}
          </h2>
          <p className="text-[9px] text-[var(--color-accent-primary)] uppercase tracking-widest mt-0.5 font-black">
            {callState === 'connecting' ? 'Connecting...' : 'Encrypted Connection'}
          </p>
        </div>

        {/* ── PIP Local Video ── */}
        <div className={`absolute z-20 rounded-[var(--radius-xl)] overflow-hidden border border-white/10 shadow-2xl bg-[#1e1e2e] transition-all hover:scale-[1.02] cursor-pointer
          ${isMobile
            ? 'top-6 right-4 w-24 h-36'
            : 'bottom-24 right-6 w-44 h-28'
          }`}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full ${isMobile ? 'object-cover' : 'object-cover'}`}
          />
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md pointer-events-none">
            <span className="text-[8px] font-black uppercase tracking-wider text-white">You</span>
          </div>
          {isVideoOff && (
            <div className="absolute inset-0 bg-[#1e1e2e] flex items-center justify-center z-10">
              <VideoOff size={24} className="text-white/30" />
            </div>
          )}
        </div>
      </div>

      {/* ── Floating Controls Pill ── */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-2xl border border-white/15 rounded-full flex items-center justify-center gap-1.5 p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-30 transition-all animate-slide-up
        ${isMobile ? 'w-[90%] max-w-[340px]' : ''}`}
      >
        {/* Mute */}
        <button
          onClick={toggleMute}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300
            ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* Toggle Video */}
        <button
          onClick={toggleVideo}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300
            ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
          title={isVideoOff ? 'Start Video' : 'Stop Video'}
        >
          {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>

        {/* Screen Share — desktop only */}
        {!isMobile && (
          <button
            onClick={toggleScreenShare}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
              ${isScreenSharing ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-primary)] hover:opacity-80' : 'bg-white/10 text-white hover:bg-white/20'}`}
            title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          >
            <Monitor size={22} />
          </button>
        )}

        {/* Flip Camera — mobile only */}
        {isMobile && (
          <button
            onClick={toggleCameraFacing}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-white/10 text-white hover:bg-white/20"
            title="Flip Camera"
          >
            <SwitchCamera size={22} />
          </button>
        )}

        {/* End Call */}
        <button
          onClick={handleEndCall}
          className="w-14 h-14 md:w-16 md:h-16 ml-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          title="End Call"
        >
          <PhoneOff size={26} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
