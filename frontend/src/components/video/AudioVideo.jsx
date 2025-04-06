import React, { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, MicOff, PhoneCall, PhoneOff } from "lucide-react";

const AudioVideo = ({ socket, SocketId }) => {
  const [stream, setStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const pendingCandidates = useRef([]);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [callStatus, setCallStatus] = useState("Disconnected");
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMuted, setIsMuted] = useState({ audio: false, video: false });
  const callTimeoutRef = useRef(null);

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    const getMedia = async () => {
      try {
        const permissions = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        permissions.getTracks().forEach((track) => track.stop());

        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        setStream(currentStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setCallStatus("Failed to access camera/microphone");
      }
    };

    getMedia();

    // Cleanup function that runs when component unmounts
    return () => {
      cleanupMedia();
    };
  }, []);

  // Function to properly clean up all media resources
  const cleanupMedia = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log(`${track.kind} track stopped on cleanup`);
      });
      setStream(null);
    }
    
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!socket || !stream) return;

    const handleOffer = (offer, fromSocketId) => {
      if (!offer || !offer.type || !offer.sdp) {
        console.error("Invalid offer received:", offer);
        return;
      }
      setIncomingCall({ fromSocketId, offer });
      setCallStatus("Incoming call...");
    };

    const handleAnswer = async (answer) => {
      if (!peerConnection || !answer || !answer.type || !answer.sdp) {
        console.error("Invalid answer received:", answer);
        endCall();
        return;
      }
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        while (pendingCandidates.current.length > 0) {
          await peerConnection.addIceCandidate(pendingCandidates.current.shift());
        }
        setCallStatus("Connected");
        setIsCalling(false);
      } catch (err) {
        console.error("Error setting remote description:", err);
        endCall();
      }
    };

    const handleIceCandidate = async (candidate) => {
      if (!candidate || !candidate.candidate) {
        console.error("Invalid ICE candidate received:", candidate);
        return;
      }
      const iceCandidate = new RTCIceCandidate(candidate);
      if (peerConnection && peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(iceCandidate);
      } else {
        pendingCandidates.current.push(iceCandidate);
      }
    };

    const handleEndCall = () => {
      endCall(false);
      setCallStatus("Call ended by remote");
      socket.emit("end-call-ack", SocketId);
    };

    const handleEndCallAck = () => {
      console.log("Remote user confirmed call closure");
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("end-call", handleEndCall);
    socket.on("end-call-ack", handleEndCallAck);

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("disconnect", () => console.log("Socket disconnected"));
    socket.on("error", (err) => console.error("Socket error:", err));

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("end-call", handleEndCall);
      socket.off("end-call-ack", handleEndCallAck);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("error");
    };
  }, [socket, stream, peerConnection]);

  const setupPeerConnection = (pc) => {
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate, SocketId);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCallStatus("Connected");
        setIsCalling(false);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        endCall(false);
        setCallStatus("Connection lost");
      }
    };

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    return pc;
  };

  const callUser = async () => {
    if (!socket || !stream || !SocketId) {
      console.error("Cannot start call - missing dependencies", { socket, stream, SocketId });
      return;
    }
    setCallStatus("Calling...");
    setIsCalling(true);

    try {
      const pc = new RTCPeerConnection(iceServers);
      setPeerConnection(pc);
      setupPeerConnection(pc);

      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      socket.emit("offer", offer, SocketId);

      callTimeoutRef.current = setTimeout(() => {
        if (callStatus === "Calling...") {
          endCall(true);
          setCallStatus("No answer");
        }
      }, 30000);
    } catch (err) {
      console.error("Error starting call:", err);
      endCall(true);
      setCallStatus("Call failed");
    }
  };

  const acceptCall = async () => {
    if (!incomingCall || !stream) {
      console.error("Cannot accept call - missing requirements", { incomingCall, stream });
      return;
    }
    try {
      const pc = new RTCPeerConnection(iceServers);
      setPeerConnection(pc);
      setupPeerConnection(pc);

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      while (pendingCandidates.current.length > 0) {
        await pc.addIceCandidate(pendingCandidates.current.shift());
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", answer, incomingCall.fromSocketId);
      setCallStatus("Connected");
      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting call:", err);
      endCall(true);
      setCallStatus("Failed to accept call");
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit("end-call", incomingCall.fromSocketId);
      setIncomingCall(null);
      setCallStatus("Disconnected");
    }
  };

  const endCall = (isLocalInitiator = false) => {
    console.log("Ending call", { isLocalInitiator });
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) {
      // We don't clear local video here because we want to keep showing it after call ends
      // We just stop remote streams
    }
    
    setCallStatus("Disconnected");
    setIsCalling(false);
    setIncomingCall(null);
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    pendingCandidates.current = [];

    if (SocketId && isLocalInitiator) {
      socket.emit("end-call", SocketId);
      const retryEndCall = setInterval(() => {
        if (callStatus !== "Disconnected") return;
        console.log("Retrying end-call signal...");
        socket.emit("end-call", SocketId);
      }, 2000);

      socket.once("end-call-ack", () => {
        clearInterval(retryEndCall);
        console.log("Remote confirmed call closure");
      });

      setTimeout(() => {
        clearInterval(retryEndCall);
        console.log("Stopped retrying end-call signal");
      }, 10000);
    }
  };

  const toggleMute = (type) => {
    if (!stream) return;
    const tracks = type === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
    tracks.forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const getStatusColor = () => {
    if (callStatus === "Connected") return "text-green-500";
    if (callStatus.includes("Failed") || callStatus === "No answer") return "text-red-500";
    return "text-blue-600";
  };

  return (
    <div className="max-w-7xl mx-auto my-8 p-8 bg-gray-50 rounded-xl shadow-lg min-h-screen">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Video Call
      </h2>
      
      <div className={`bg-white p-5 rounded-lg mb-8 text-center font-semibold text-lg ${getStatusColor()} shadow-sm`}>
        Status: {callStatus}
      </div>
      
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Incoming Video Call</h3>
            <p className="text-gray-600 text-lg">From user: {incomingCall.fromSocketId}</p>
            <div className="flex justify-center gap-6 mt-8">
              <button 
                onClick={acceptCall}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-lg transition-colors"
              >
                Accept
              </button>
              <button 
                onClick={rejectCall}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-lg transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-8 justify-center mb-8">
        <div className="flex-1 min-w-96 max-w-2xl">
          <h3 className="text-xl font-semibold text-center mb-4 text-gray-700">
            You
          </h3>
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-96 rounded-lg border-4 border-gray-200 bg-black object-cover shadow-md"
            />
            {isMuted.video && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <VideoOff size={64} className="text-white opacity-70" />
              </div>
            )}
            {isMuted.audio && (
              <div className="absolute top-4 right-4 bg-red-500 rounded-full p-2">
                <MicOff size={24} className="text-white" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-96 max-w-2xl">
          <h3 className="text-xl font-semibold text-center mb-4 text-gray-700">
            Remote
          </h3>
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-96 rounded-lg bg-black object-cover shadow-md ${
                callStatus === "Connected" ? "border-4 border-green-500" : "border-4 border-gray-200"
              }`}
            />
            {callStatus !== "Connected" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-lg">
                <p className="text-white text-xl font-medium">Waiting for connection...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mt-10 flex-wrap">
        <button
          onClick={callUser}
          disabled={!SocketId || isCalling || callStatus === "Connected" || incomingCall}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all ${
            !SocketId || isCalling || callStatus === "Connected" || incomingCall
              ? "bg-green-400 opacity-50 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          <PhoneCall size={20} />
          <span>Start Call</span>
        </button>
        
        <button
          onClick={() => endCall(true)}
          disabled={callStatus === "Disconnected" && !incomingCall}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all ${
            callStatus === "Disconnected" && !incomingCall
              ? "bg-red-400 opacity-50 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          <PhoneOff size={20} />
          <span>End Call</span>
        </button>

        <button
          onClick={() => toggleMute("audio")}
          disabled={!stream}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all ${
            !stream
              ? "bg-blue-400 opacity-50 cursor-not-allowed"
              : isMuted.audio
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isMuted.audio ? (
            <>
              <MicOff size={20} />
              <span>Unmute</span>
            </>
          ) : (
            <>
              <Mic size={20} />
              <span>Mute</span>
            </>
          )}
        </button>

        <button
          onClick={() => toggleMute("video")}
          disabled={!stream}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all ${
            !stream
              ? "bg-blue-400 opacity-50 cursor-not-allowed"
              : isMuted.video
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isMuted.video ? (
            <>
              <Video size={20} />
              <span>Show Video</span>
            </>
          ) : (
            <>
              <VideoOff size={20} />
              <span>Hide Video</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AudioVideo;