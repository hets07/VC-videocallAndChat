import React, { useEffect, useState, useRef } from 'react';
import { getMessages, setReciverId, setSocketId, setUser, setprofile } from '../../Store/chat/chatSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import { convertToLocalTime } from "../../helper/localtime.js";


const Chatsidebar = ({ setUserSelected }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.data?.user || {});
  const { friends, Socket } = useSelector((state) => state.chat);

  const [friendList, setFriendList] = useState([]);
  const [newMessages, setNewMessages] = useState({});
  const selectedUserRef = useRef(null);

  useEffect(() => {
    if (friends?.friends?.friends) {
      setFriendList(friends.friends.friends);
    }
  }, [friends]);

  useEffect(() => {
  if (!Socket) return;

  const handleNewMsg = (userId) => {
    const idStr = userId?.toString();
    setNewMessages((prev) => ({
      ...prev,
      [idStr]: (prev[idStr] || 0) + 1,
    }));
  };

  const handleOnline = (data) => {
    setFriendList((prevList) =>
      prevList.map((friend) => {
        const friendId = friend._id?.toString();
        return data.hasOwnProperty(friendId)
          ? { ...friend, SocketId: data[friendId] }
          : friend;
      })
    );

    const selectedUser = selectedUserRef.current?.toString();
    if (selectedUser === Object.keys(data)[0]) {
      dispatch(setSocketId(data[selectedUser]));
    }
  };

  Socket.on("newmsgalert", handleNewMsg);
  Socket.on("online", handleOnline);

  return () => {
    Socket.off("newmsgalert", handleNewMsg);
    Socket.off("online", handleOnline);
  };
}, [Socket, dispatch]);

  console.log(newMessages);
  
  return (
    <div
     className="w-full sm:w-[300px] h-screen overflow-y-auto border-r border-gray-200 bg-white"
      id="chatUsers"
      onMouseDown={() => {
        dispatch(setReciverId(null));
        selectedUserRef.current = null;
        dispatch(setSocketId(null));
        dispatch(setUser(null));
        dispatch(setprofile(null));
        setUserSelected(false);
      }}
    >
      {friendList.map((value, index) => {
        const friendId = value._id?.toString();        
        let unreadCount = newMessages.friendId;
        console.log(newMessages.friendId);
        
        return (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 hover:bg-blue-100 transition relative cursor-pointer shadow-sm"
            tabIndex={index}
            onClick={() => {
              dispatch(getMessages({ senderId: user._id, receiverId: friendId }));
              dispatch(setReciverId(friendId));
              selectedUserRef.current = friendId;
              dispatch(setSocketId(value.SocketId));
              dispatch(setUser(value.name));
              dispatch(setprofile(value.profile));
              setUserSelected(true);
              setNewMessages((prev) => ({
                ...prev,
                [friendId]: 0,
              }));
              Socket.emit("statuschange",friendId,value.SocketId)
            }}
          >
            {/* Profile Image */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
              <img
                src={value.profile || '/default-avatar.png'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="text-base font-medium text-gray-900 truncate">{value.name} {value.surname}</p>
              </div>
                <span className={` text-gray-400 ml-2 flex-shrink-0 ${value.SocketId?"text-green-900 text-sm ":""} `}>{value.SocketId?"online":`lastseen: ${convertToLocalTime(value.lastseen)}`}</span>
            </div>

            {/* Notification Badge */}
            {newMessages[value._id] > 0 && (
              <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {newMessages[value._id]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Chatsidebar;
