import React, { useEffect, useRef, useState } from "react";
import Chatheader from "./Chatcontainer/Chatheader.jsx";
import ChatFooter from "./Chatcontainer/ChatFooter";
import data from "../../JsonData/chats.js";
import { EllipsisVertical, ArrowDown } from "lucide-react"; // Using Lucide icons
import { useDispatch, useSelector } from "react-redux";

const Chatcontainer = () => {
  const [id, setId] = useState("65e8a1fbc9f43b001a6e5f00");
  const chatRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

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
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-green-300 w-[390px] h-[500px] flex flex-col relative">
      <Chatheader setId={setId} />

      {/* Chat Messages Container */}
      <div
        className="bg-red-400 w-full flex flex-col gap-2 overflow-y-auto p-2"
        ref={chatRef}
      >
        {data.map((value, index) => (
          <React.Fragment key={index}>
            {value.media ? (
              <div
                className={`${
                  value.senderId === id ? "self-end" : "self-start"
                }`}
              >
                <img src="" alt="" />
              </div>
            ) : (
              ""
            )}
            <div
              className={`max-w-[70%] text-white p-2 rounded-lg flex justify-between gap-4 ${
                value.senderId === id
                  ? "bg-blue-500 self-end"
                  : "bg-gray-500 self-start"
              }`}
            >
              <span>{value.message}</span>
              <span className="w-fit h-[20px]">
                <EllipsisVertical size={15} />
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition"
        >
          <ArrowDown size={20} />
        </button>
      )}

      {/* Footer Input */}
      <ChatFooter />
    </div>
  );
};

export default Chatcontainer;
