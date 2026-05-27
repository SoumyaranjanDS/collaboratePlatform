import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, Monitor, SwitchCamera } from 'lucide-react';
import toast from 'react-hot-toast';
<<<<<<< HEAD
import { playCallingSound, playHangupSound } from '../data/sounds';
=======
>>>>>>> 965c28a563988d32b5329d00ce26b236a8c45987

const VideoCall = ({ socket, currentUser, peerUser, isCaller, incomingOffer, onCallEnded }) => {
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callState, setCallState] = useState('connecting'); // 'connecting', 'connected', 'ended'
  const [facingMode, setFacingMode] = useState('user');
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const screenStreamRef = useRef(null);
<<<<<<< HEAD
  const callingAudioRef = useRef(null);
=======
>>>>>>> 965c28a563988d32b5329d00ce26b236a8c45987

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
<<<<<<< HEAD
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
=======
      { urls: 'stun:stun1.l.google.com:19302' }
>>>>>>> 965c28a563988d32b5329d00ce26b236a8c45987
    ]
  };

  useEffect(() => {
    let isMounted = true;
    let stream;
    const initializeCall = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: true });
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

        // Add local tracks to peer connection
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Set remote stream
        pc.ontrack = (event) => {
          if (!isMounted) return;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallState('connected');
          }
        };

        // Send ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && isMounted) {
            socket.emit('ice-candidate', { to: peerUser, candidate: event.candidate });
          }
        };

        // Handle connection disconnect/failure
        pc.onconnectionstatechange = () => {
          if (!isMounted) return;
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
            toast.error(`Connection lost with @${peerUser}`);
            cleanupCall();
          }
        };

        if (isCaller) {
<<<<<<< HEAD
          callingAudioRef.current = playCallingSound();
          const offer = await pc.createOffer();
          if (!isMounted) {
            if (callingAudioRef.current) {
              callingAudioRef.current.pause();
            }
=======
          const offer = await pc.createOffer();
          if (!isMounted) {
>>>>>>> 965c28a563988d32b5329d00ce26b236a8c45987
            pc.close();
            return;
          }
          await pc.setLocalDescription(offer);
          socket.emit('call-user', { to: peerUser, offer });
        } else if (incomingOffer && pc.signalingState === 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
          const answer = await pc.createAnswer();
          if (!isMounted) {
            pc.close();
            return;
          }
          await pc.setLocalDescription(answer);
          socket.emit('call-accepted', { to: peerUser, answer });
        }

        if (!isMounted) {
<<<<<<< HEAD
          if (callingAudioRef.current) {
            callingAudioRef.current.pause();
          }
=======
>>>>>>> 965c28a563988d32b5329d00ce26b236a8c45987
          pc.close();
          return;
        }

        // Socket listeners inside hook
        const queuedIceCandidates = [];
        let isSettingDescription = false;

        socket.on('call-accepted', async ({ answer }) => {
          if (!isMounted) return;
<<<<<<< HEAD
          if (callingAudioRef.current) {
            callingAudioRef.current.pause();
            callingAudioRef.current = null;
          }
=======
>>>>>>> 965c28a563988d32b5329d00ce26b236a8c45987
          if (pcRef.current && pcRef.current.signalingState === 'have-local-offer' && !isSettingDescription) {
            isSettingDescription = true;
            try {
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
              setCallState('connected');
              while (queuedIceCandidates.length > 0) {
                const candidate = queuedIceCandidates.shift();
                try {
                  await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                  console.error('Error adding queued ICE candidate:', err);
                }
              }
            } catch (err) {
              console.error('Error setting remote description:', err);
            } finally {
              isSettingDescription = false;
            }
          }
        });

        socket.on('ice-candidate', async ({ candidate }) => {
          if (!isMounted) return;
          if (pcRef.current) {
            try {
              if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
              } else {
                queuedIceCandidates.push(candidate);
              }
            } catch (err) {
              console.error('Error adding ICE candidate:', err);
            }
          }
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
        console.error('Failed to access media devices:', err);
        toast.error('Could not start media stream. Verify permissions.');
        cleanupCall();
      }
    };

    const timer = setTimeout(() => {
      initializeCall();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
<<<<<<< HEAD
      if (callingAudioRef.current) {
        callingAudioRef.current.pause();
      }
=======
>>>>>>> 965c28a563988d32b5329d00ce26b236a8c45987
      socket.off('call-accepted');
      socket.off('ice-candidate');
      socket.off('call-rejected');
      socket.off('end-call');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [peerUser, isCaller, incomingOffer, socket]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleCameraFacing = async () => {
    if (isScreenSharing) {
      toast.error("Cannot switch camera while screen sharing");
      return;
    }
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextMode },
        audio: !isMuted
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (pcRef.current) {
        const senders = pcRef.current.getSenders();
        const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }

      if (localStream) {
        localStream.getVideoTracks().forEach(track => track.stop());
      }

      const mergedStream = new MediaStream([
        newVideoTrack,
        ...(localStream ? localStream.getAudioTracks() : [])
      ]);

      setLocalStream(mergedStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mergedStream;
      }
      setFacingMode(nextMode);
      setIsVideoOff(false);
      toast.success(`Switched to ${nextMode === 'user' ? 'front' : 'rear'} camera`);
    } catch (err) {
      console.error("Error switching camera:", err);
      toast.error("Failed to switch camera device");
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        if (pcRef.current) {
          const senders = pcRef.current.getSenders();
          const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video');
          if (videoSender) {
            await videoSender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        const mergedStream = new MediaStream([
          screenTrack,
          ...(localStream ? localStream.getAudioTracks() : [])
        ]);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mergedStream;
        }

        setIsScreenSharing(true);
        toast.success("Screen sharing started");
      } catch (err) {
        console.error("Error starting screen share:", err);
        toast.error("Could not start screen sharing");
      }
    }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: !isMuted
      });

      const cameraVideoTrack = cameraStream.getVideoTracks()[0];
      if (pcRef.current) {
        const senders = pcRef.current.getSenders();
        const videoSender = senders.find(sender => sender.track && sender.track.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(cameraVideoTrack);
        }
      }

      if (localStream) {
        localStream.getVideoTracks().forEach(track => track.stop());
      }

      const mergedStream = new MediaStream([
        cameraVideoTrack,
        ...(localStream ? localStream.getAudioTracks() : [])
      ]);

      setLocalStream(mergedStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mergedStream;
      }
      setIsScreenSharing(false);
      setIsVideoOff(false);
      toast.success("Screen sharing stopped, camera restored");
    } catch (err) {
      console.error("Error restoring camera after screen share:", err);
      setIsScreenSharing(false);
    }
  };

  const cleanupCall = () => {
    setCallState('ended');
<<<<<<< HEAD
    playHangupSound();
    if (callingAudioRef.current) {
      callingAudioRef.current.pause();
      callingAudioRef.current = null;
    }
=======
>>>>>>> 965c28a563988d32b5329d00ce26b236a8c45987
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    onCallEnded();
  };

  const handleEndCall = () => {
    socket.emit('end-call', { to: peerUser });
    cleanupCall();
  };

  return (
    <div className="absolute inset-0 bg-black/95 z-50 flex flex-col justify-between p-6">
      {/* Peer Name Banner */}
      <div className="text-center z-10">
        <h2 className="text-xl font-bold text-white tracking-wide">Video Call with @{peerUser}</h2>
        <p className="text-xs text-slate-500 uppercase mt-1 tracking-widest font-semibold">
          {callState === 'connecting' ? 'Connecting to peer...' : 'Active Stream'}
        </p>
      </div>

      {/* Main Video Section */}
      <div className="flex-1 flex items-center justify-center relative w-full h-full max-h-[70vh] rounded-3xl overflow-hidden bg-black border border-white/5 shadow-2xl">
        {/* Remote Video (Main view) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-3xl"
        />

        {/* Remote Video Label Overlay */}
        {callState === 'connected' && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/5 select-none pointer-events-none z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">@{peerUser}</span>
          </div>
        )}

        {callState === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
            <Loader2 className="animate-spin text-accent-indigo" size={40} />
            <span className="text-slate-400 text-sm font-semibold">Connecting WebRTC Peer Connection...</span>
          </div>
        )}

        {/* Local Video (PIP view) */}
        <div className="absolute bottom-4 right-4 w-32 h-44 md:w-40 md:h-56 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 z-10">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Local Video Label Overlay */}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/5 select-none pointer-events-none z-20">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">You</span>
          </div>
          {isVideoOff && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-slate-600 z-10">
              <VideoOff size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons panel */}
      <div className="flex justify-center items-center gap-4 md:gap-6 z-10 pb-4">
        <button
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
          title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isVideoOff ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
          title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        <button
          onClick={handleEndCall}
          className="w-16 h-16 bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center transition-all shadow-red-glow"
          title="End Call"
        >
          <PhoneOff size={24} />
        </button>

        <button
          onClick={toggleScreenShare}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isScreenSharing ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
          title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
        >
          <Monitor size={20} />
        </button>

        <button
          onClick={toggleCameraFacing}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
          title="Switch Camera (Mobile)"
        >
          <SwitchCamera size={20} />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
