import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, Monitor, SwitchCamera } from 'lucide-react';
import toast from 'react-hot-toast';
import { playCallingSound, playHangupSound } from '../data/sounds';

const isMobileDevice = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const VideoCall = ({ socket, currentUser, peerUser, isCaller, incomingOffer, onCallEnded }) => {
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
    <div className="fixed inset-0 bg-black z-50 flex flex-col" style={{ touchAction: 'none' }}>

      {/* ── Header Banner ── */}
      <div className="shrink-0 text-center pt-safe pt-4 pb-3 px-4 bg-black/80 backdrop-blur-md border-b border-white/5">
        <h2 className="text-base font-bold text-white tracking-wide">
          📹 {peerUser}
        </h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-semibold">
          {callState === 'connecting' ? 'Connecting...' : 'Live'}
        </p>
      </div>

      {/* ── Main Video Area ── */}
      <div className="flex-1 relative overflow-hidden bg-black">

        {/* Remote video — fills entire area, portrait on mobile */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`absolute inset-0 w-full h-full ${isMobile ? 'object-cover' : 'object-contain'}`}
        />

        {/* Connecting overlay */}
        {callState === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 gap-4 z-10">
            <Loader2 className="animate-spin text-indigo-400" size={44} />
            <span className="text-slate-400 text-sm font-semibold">Connecting to @{peerUser}...</span>
          </div>
        )}

        {/* Connected label */}
        {callState === 'connected' && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 z-10 pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">@{peerUser}</span>
          </div>
        )}

        {/* ── PIP Local Video ──
            Mobile: top-right corner, portrait shape
            Desktop: bottom-right corner, landscape shape */}
        <div className={`absolute z-20 rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900
          ${isMobile
            ? 'top-3 right-3 w-24 h-36'
            : 'bottom-4 right-4 w-36 h-24 md:w-44 md:h-28'
          }`}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full ${isMobile ? 'object-cover' : 'object-cover'}`}
          />
          <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md pointer-events-none">
            <span className="text-[7px] font-black uppercase tracking-wider text-slate-400">You</span>
          </div>
          {isVideoOff && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
              <VideoOff size={20} className="text-slate-600" />
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className={`shrink-0 bg-black/90 backdrop-blur-md border-t border-white/5 flex items-center justify-center gap-3 md:gap-5 pb-safe
        ${isMobile ? 'py-4 px-4' : 'py-5 px-6'}`}
      >
        {/* Mute */}
        <button
          onClick={toggleMute}
          className={`flex flex-col items-center gap-1 group`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
            ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/8 text-slate-300 border border-white/10 group-hover:bg-white/15'}`}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </div>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* Toggle Video */}
        <button
          onClick={toggleVideo}
          className="flex flex-col items-center gap-1 group"
          title={isVideoOff ? 'Start Video' : 'Stop Video'}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
            ${isVideoOff ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/8 text-slate-300 border border-white/10 group-hover:bg-white/15'}`}>
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </div>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">Video</span>
        </button>

        {/* End Call */}
        <button
          onClick={handleEndCall}
          className="flex flex-col items-center gap-1"
          title="End Call"
        >
          <div className="w-16 h-16 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <PhoneOff size={26} />
          </div>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">End</span>
        </button>

        {/* Screen Share — desktop only */}
        {!isMobile && (
          <button
            onClick={toggleScreenShare}
            className="flex flex-col items-center gap-1 group"
            title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
              ${isScreenSharing ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' : 'bg-white/8 text-slate-300 border border-white/10 group-hover:bg-white/15'}`}>
              <Monitor size={20} />
            </div>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Screen</span>
          </button>
        )}

        {/* Flip Camera — mobile only */}
        {isMobile && (
          <button
            onClick={toggleCameraFacing}
            className="flex flex-col items-center gap-1 group"
            title="Flip Camera"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white/8 text-slate-300 border border-white/10 group-hover:bg-white/15">
              <SwitchCamera size={20} />
            </div>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Flip</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
