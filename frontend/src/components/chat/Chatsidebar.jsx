import React, { useEffect, useState, useRef } from 'react';
import { getMessages, setReciverId, setSocketId, setUser, setprofile } from '../../Store/chat/chatSlice.js';
import { useSelector, useDispatch } from 'react-redux';

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

    Socket.on("newmsgfrom", handleNewMsg);
    Socket.on("online", handleOnline);

    return () => {
      Socket.off("newmsgfrom", handleNewMsg);
      Socket.off("online", handleOnline);
    };
  }, [Socket, dispatch]);

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
    {friendList.map((friend) => (
  <div
    key={friend._id}
    onClick={() => {
      dispatch(setUser(friend));
      dispatch(setReciverId(friend._id));
      dispatch(getMessages(friend._id));
      dispatch(setprofile(friend.profile));
      selectedUserRef.current = friend._id;
      setUserSelected(true);
      setNewMessages((prev) => ({ ...prev, [friend._id]: 0 }));
    }}
    className="flex items-center justify-between p-4 hover:bg-gray-100 cursor-pointer border-b"
  >
    <div className="flex items-center space-x-3">
      <img
        src={friend.profile || "/default-avatar.png"}
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover"
      />
      <span className="font-medium text-sm">{friend.name}</span>
    </div>
    {newMessages[friend._id] > 0 && (
      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
        {newMessages[friend._id]}
      </span>
    )}
  </div>
))}

    </div>
  );
};

export default Chatsidebar;
