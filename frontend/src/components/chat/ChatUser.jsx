import React from "react";

const ChatUser = ({ users, index }) => {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 hover:bg-blue-100 transition cursor-pointer shadow-sm w-full max-w-[350px]"
      tabIndex={index}
    >

      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
        <img
          src={users.profile || "/default-avatar.png"}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="text-base font-medium text-gray-900 truncate">{users.name}</p>
          <span className="text-xs text-gray-400 ml-2 flex-shrink-0 whitespace-nowrap">12:30 PM</span>
        </div>
        <p className="text-sm text-gray-500 truncate">Receiver name: message typing...</p>
      </div>
    </div>
  );
};

export default ChatUser;
