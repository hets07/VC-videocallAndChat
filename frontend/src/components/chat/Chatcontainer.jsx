import React, { useEffect, useRef, useState } from "react";
import Chatheader from "./Chatcontainer/Chatheader.jsx";
import ChatFooter from "./Chatcontainer/ChatFooter";
import { EllipsisVertical, ArrowDown, MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";

const Chatcontainer = ({ userSelected }) => {
  const { user } = useSelector((state) => state.auth.data || {});
  const { messages } = useSelector((state) => state.chat || {});
  const { Socket } = useSelector((state) => state.chat);
  const chatRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userTyping, setUserTyping] = useState(false);

  const [localMessages, setLocalMessages] = useState(
    Array.isArray(messages?.messages) ? messages.messages : []
  );

  const convertToLocalTime = (utcTime) => {
    if (!utcTime) return "";
    const date = new Date(utcTime);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    if (Socket) {
      Socket.on("userTyping", () => {
        setUserTyping(true);
        scrollToBottom();
      });

      Socket.on("notTyping", () => {
        setUserTyping(false);
      });

      Socket.on("sentmessage", (newMessage) => {
        setLocalMessages((prev) => [...prev, newMessage]);
        setTimeout(scrollToBottom, 100);
      });

      Socket.on("newmessage", (newMessage) => {
        setUserTyping(false);
        setLocalMessages((prev) => [...prev, newMessage]);
        setTimeout(scrollToBottom, 100);
      });

      return () => {
        Socket.off("userTyping");
        Socket.off("notTyping");
        Socket.off("sentmessage");
        Socket.off("newmessage");
      };
    }
  }, [Socket]);

  useEffect(() => {
    setLocalMessages(Array.isArray(messages?.messages) ? messages.messages : []);
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [localMessages]);

  useEffect(() => {
    const handleScroll = () => {
      if (chatRef.current) {
        const isAtBottom =
          chatRef.current.scrollHeight - chatRef.current.scrollTop <=
          chatRef.current.clientHeight + 10;
        setShowScrollButton(!isAtBottom);
      }
    };

    if (chatRef.current) {
      chatRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatRef.current) {
        chatRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToBottom = () => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current.scrollTo({
          top: chatRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  if (!userSelected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-white p-6 rounded-xl shadow-md">
        <MessageCircle size={48} className="mb-4 text-gray-400" />
        <p className="text-lg font-semibold">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-screen sm:max-w-md mx-auto border bg-white">
    <Chatheader userSelected={userSelected} />
  
    <div
      ref={chatRef}
      className="flex-1 overflow-y-auto px-3 py-2 space-y-3 bg-gray-50"
    >
      {localMessages.map((msg, index) => (
        <div
          key={index}
          className={`max-w-[80%] p-2 rounded-xl text-sm break-words ${
            msg.senderId === user._id
              ? "bg-blue-500 text-white self-end ml-auto"
              : "bg-gray-200 text-black self-start mr-auto"
          }`}
        >
          <p>{msg.message}</p>
          <p className="text-[10px] text-right mt-1 opacity-60">
            {convertToLocalTime(msg.createdAt)}
          </p>
        </div>
      ))}
  
      {userTyping && (
        <div className="text-xs text-gray-500 italic">Typing...</div>
      )}
    </div>
  
    <ChatFooter userSelected={userSelected} />
  </div>
  
  );
};

export default Chatcontainer;
