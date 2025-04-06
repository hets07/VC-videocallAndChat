import React, { useState, useRef, useEffect } from "react";
import { Paperclip, SendHorizontal, Smile, X } from "lucide-react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../helper/axios";
import imageCompression from "browser-image-compression";

const ChatFooter = () => {
  const fileInputRef = useRef(null);
  const { Socket, reciverId, SocketId } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth.data);
  const [message, setMessage] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [media, setMedia] = useState(null);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Image compression failed:", error);
      return file;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() && !media) return;

    let mediaObject = null;

    if (media) {
      const compressedFile = await compressImage(media);

      const formData = new FormData();
      formData.append("picture", compressedFile);
      formData.append("senderId", user._id);
      formData.append("receiverId", reciverId);

      try {
        const response = await axiosInstance.post("/api/chat/sentphoto", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        mediaObject = response.data.media;
        setFilePreview(null);
        setMedia(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("File upload failed:", error);
        return;
      }
    }

    if (Socket) {
      Socket.emit("sendmessage", reciverId, message, SocketId, mediaObject);
    }

    setMessage("");
    setFilePreview(null);
    setMedia(null);
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMedia(file);

    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <footer className="bg-white border-t border-gray-300 p-3 rounded-b-xl shadow-sm">
      {filePreview && (
        <div className="relative mb-3 w-fit mx-auto">
          <img
            src={filePreview}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-md border border-gray-200 shadow"
          />
          <button
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
            onClick={() => {
              setFilePreview(null);
              setMedia(null);
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form className="flex items-center gap-3" onSubmit={handleSend}>
        <input
          type="text"
          name="message"
          id="message"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            Socket?.emit("userTyping", SocketId);
          }}
          onBlur={() => Socket?.emit("notTyping", SocketId)}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="button"
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Smile size={22} />
        </button>

        <button
          type="button"
          onClick={handleFileClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Paperclip size={22} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <SendHorizontal size={22} />
        </button>
      </form>
    </footer>
  );
};

export default ChatFooter;
