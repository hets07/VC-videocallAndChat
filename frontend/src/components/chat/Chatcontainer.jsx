import React, { useEffect, useRef, useState } from "react";
import Chatheader from "./Chatcontainer/Chatheader.jsx";
import ChatFooter from "./Chatcontainer/ChatFooter";
import { EllipsisVertical, ArrowDown, MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { convertToLocalTime } from "../../helper/localtime.js";

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

      Socket.on("msgread",()=>{
        setLocalMessages((prevMessages) =>
          prevMessages.map((msg) => {
            console.log(msg.msgstatus);
            
            
            if ( msg.msgstatus !== "read") {
              return { ...msg, msgstatus: "read" };
            }
            console.log(msg.msgstatus);

            return msg;
          })
        );
      })

      return () => {
        Socket.off("userTyping");
        Socket.off("notTyping");
        Socket.off("sentmessage");
        Socket.off("newmessage");
        Socket.off("msgread")
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
    <div className="bg-white w-full h-full flex flex-col relative rounded-xl shadow-md">
      <Chatheader />

      <div
        className="flex-1 w-full flex flex-col gap-2 overflow-y-auto p-4"
        ref={chatRef}
      >
        {localMessages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet</p>
        ) : (
          localMessages.map((value, index) => (
            <React.Fragment key={index}>
              {value.media && (
                <div
                  className={`${
                    value.senderId === user?._id ? "self-end" : "self-start"
                  }`}
                >
                  <img
                    src={value.media}
                    alt="Media"
                    className="max-w-[200px] rounded-lg"
                    onLoad={scrollToBottom}
                  />
                </div>
              )}

              {value.message && (
                <div
                  className={`max-w-[70%] p-3 rounded-xl flex flex-col gap-1 shadow-md ${
                    value.senderId === user?._id
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-200 text-gray-800 self-start"
                  }`}
                >
                  <span>{value.message}</span>
                  <div className="flex justify-between items-center gap-2 text-xs text-gray-300">
                    <span>{convertToLocalTime(value.createdAt)}  </span>
                    
                    {value.senderId === user?._id ?value.msgstatus && <span> {value.msgstatus}</span>:""}
                    <EllipsisVertical size={15} />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        )}

        {userTyping && (
          <div className="italic text-sm text-gray-500 self-start bg-gray-100 px-3 py-1 rounded-lg shadow">
            Typing...
          </div>
        )}

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 transition"
          >
            <ArrowDown size={20} />
          </button>
        )}
      </div>

      <ChatFooter />
    </div>
  );
};

export default Chatcontainer;
