import React from "react";

const Chatusers = () => {


  
  return (
    <div className="bg-green-300 flex items-center gap-4 p-2 max-w-[350px] h-[72px] rounded-lg shadow-md">

      <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center">
        <img src="" alt="Profile" className="w-full h-full object-cover rounded-full" />
      </div>

      <div className="w-[70%] flex flex-col">
        <span className="font-semibold text-gray-900">Name</span>
        <span className="text-sm text-gray-600 truncate">Receiver name: message typing...</span>
      </div>

      <span className="text-xs text-gray-500">12:30 PM</span>
    </div>
  );
};

export default Chatusers;
