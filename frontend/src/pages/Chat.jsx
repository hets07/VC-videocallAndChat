import React, { useState, useEffect } from 'react'
import Chatcontainer from '../components/chat/Chatcontainer.jsx'
import Chatsidebar from '../components/chat/Chatsidebar.jsx'
import { useDispatch, useSelector } from "react-redux";
import { getFriends, setSocket } from "../Store/chat/chatSlice.js";
import { io } from "socket.io-client";
import axiosInstance from '../helper/axios.js';

const Chat = () => {
      const [userSelected, setUserSelected] = useState(false)
      const [showSidebar, setShowSidebar] = useState(true);
      const [search, setSearch] = useState("")
      const [searchedUser, setSearchedUser] = useState(null)
      const dispatch = useDispatch()
      const user = useSelector((state) => state.auth?.data?.user || {})
      const CHAT_SOCKET_URL = "http://localhost:5000";






      useEffect(() => {
            if (!user?._id) return;

            const socket = io(CHAT_SOCKET_URL, {
                  transports: ["websocket"],
                  reconnection: true,
                  autoConnect: true,
                  query: { userId: user._id },
            });


            dispatch(setSocket(socket)); // Store socket instance

            return () => {
                  socket.disconnect();
            };
      }, [user?._id]);




      useEffect(() => {


            if (user.username) {
                  dispatch(getFriends({ username: user.username }));
            }
      }, [user.username, dispatch]);






      useEffect(() => {
            const timer = setTimeout(() => {
                  setShowSidebar(true);
            }, 3000);

            return () => clearTimeout(timer);
      }, []);


      const handleSearch = async () => {
            if (!search.trim()) return;

            try {
                  const response = await axiosInstance.get(`/api/chat/searchuser/${search}`)
                  setShowSidebar(false)
                  setSearchedUser(response.data.user)

                  setSearch("")
            } catch (error) {
                  console.log(error);

            }

      }
      return (
            <div className="flex h-screen bg-blue-100 w-full">
              {/* Sidebar */}
              <div className="flex flex-col w-1/3 max-w-xs bg-white shadow-lg border-r border-gray-300">
                {/* Top search and toggle area */}
                <div className="p-4 border-b border-gray-300">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      type="text"
                      value={search}
                      placeholder="Search users..."
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                      onClick={handleSearch}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Search
                    </button>
                  </div>
                  <div className="flex justify-around text-sm text-gray-700">
                    <span
                      onClick={() => setShowSidebar(true)}
                      className={`cursor-pointer hover:text-blue-600 ${showSidebar ? "font-bold" : ""}`}
                    >
                      Chats
                    </span>
                    <span
                      onClick={() => {
                        setShowSidebar(false);
                        setUserSelected(false);
                      }}
                      className={`cursor-pointer hover:text-blue-600 ${!showSidebar ? "font-bold" : ""}`}
                    >
                      Friends
                    </span>
                  </div>
                </div>
          
                {/* Sidebar content */}
                <div className="flex-1 overflow-y-auto">
                  {showSidebar ? (
                    <Chatsidebar setUserSelected={setUserSelected} />
                  ) : (
                    <div className="p-2">
                      {searchedUser && searchedUser.length > 0 ? (
                        searchedUser.map((value, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 bg-yellow-100 p-3 mb-2 rounded shadow-sm hover:bg-yellow-200"
                          >
                            <img src={value.profile} alt="" className="h-12 w-12 rounded-full object-cover" />
                            <div className="flex-1">
                              <p className="font-medium">{value.name}</p>
                              <button className="text-blue-500 hover:underline">Send Request</button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-sm text-gray-500 mt-4">No users found.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
          
              {/* Chat Container */}
              <div className="flex-1 bg-gray-100">
                <Chatcontainer userSelected={userSelected} />
              </div>
            </div>
          );
          
}

export default Chat