import React, { useEffect, useState } from "react";
import { Video, Circle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import AudioVideo from "../../video/AudioVideo";

const Chatheader = () => {
  const { selectedUser, SocketId, Socket, selectedUserProfile } = useSelector(
    (state) => state.chat || {}
  );
  const dispatch = useDispatch();
  const [isCalling, setIsCalling] = useState(false);

  // Incoming call handler

  // Handle offline and receiving call
 

  const startCall = () => {
    if (Socket && SocketId) {
      setIsCalling(true);
      Socket.emit("answere", { to: SocketId });
    }
  };

  return (
    <>
      <header className="bg-blue-100 px-4 py-3 flex items-center justify-between border-b border-blue-200 shadow-sm rounded-t-xl">
        {/* User Image */}
        <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-300">
          <img
            src={selectedUserProfile}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Name & Online Status */}
        <div className="flex flex-col items-start flex-1 px-4">
          <span className="font-semibold text-base text-gray-800">
            {selectedUser}
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Circle
              size={10}
              fill={SocketId ? "lightgreen" : "red"}
              strokeWidth={0}
            />
            <span>{SocketId ? "online" : "offline"}</span>
          </div>
        </div>

        {/* Video Call Icon */}
        <button
          onClick={startCall}
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          disabled={!SocketId}
          title={SocketId ? "Start Video Call" : "User is offline"}
        >
          <Video className="text-blue-600" />
        </button>
      </header>

      {/* Video Call Modal */}
      {isCalling && <AudioVideo onClose={() => setIsCalling(false)} 
        socket={Socket} SocketId={SocketId}
      />}
    </>
  );
};

export default Chatheader;
