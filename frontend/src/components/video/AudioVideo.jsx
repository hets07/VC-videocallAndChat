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
    <div className="max-w-7xl mx-auto my-8 p-4 sm:p-8 bg-gray-50 rounded-xl shadow-lg min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
        Video Call
      </h2>

      <div
        className={`bg-white p-4 sm:p-6 rounded-lg mb-6 text-center font-semibold text-base sm:text-lg ${getStatusColor()} shadow-sm`}
      >
        Status: {callStatus}
      </div>

      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl text-center max-w-md w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Incoming Video Call</h3>
            <p className="text-gray-600 text-base sm:text-lg">
              From user: {incomingCall.fromSocketId}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-6">
              <button
                onClick={acceptCall}
                className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-base sm:text-lg transition-colors"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-base sm:text-lg transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Area (add your video elements here) */}
      <div className="flex flex-wrap gap-6 justify-center items-center">
        {/* Example placeholder */}
        <div className="w-72 h-44 bg-gray-300 rounded-lg shadow-inner"></div>
        <div className="w-72 h-44 bg-gray-200 rounded-lg shadow-inner"></div>
      </div>
    </div>
  );
};

export default AudioVideo;