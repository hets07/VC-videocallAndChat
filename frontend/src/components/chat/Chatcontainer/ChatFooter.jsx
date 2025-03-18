import React, { useRef } from "react";
import { Paperclip, SendHorizontal, Smile } from "lucide-react";

const ChatFooter = () => {
  const fileInputRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    console.log("Message Sent");
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  return (
    <footer className="bg-blue-300 h-16 flex items-center px-4 border-t border-gray-300">
      <form className="flex items-center w-full gap-2" onSubmit={handleSend}>
        {/* Message Input */}
        <input
          type="text"
          name="message"
          id="message"
          placeholder="Enter message..."
          className="border border-gray-400 p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Emoji Button */}
        <button type="button" className="p-2 hover:bg-blue-200 rounded-lg">
          <Smile color="black" size={24} />
        </button>

        {/* File Upload Button */}
        <button
          type="button"
          className="p-2 hover:bg-blue-200 rounded-lg"
          onClick={handleFileClick}
        >
          <Paperclip size={24} />
        </button>
        <input type="file" ref={fileInputRef} className="hidden" />

        {/* Send Button */}
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <SendHorizontal size={24} />
        </button>
      </form>
    </footer>
  );
};

export default ChatFooter;
