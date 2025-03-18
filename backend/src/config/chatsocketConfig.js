import { Server as socketIoserver } from "socket.io";
import User from "../models/user.js";
import Chat from "../models/chat.js";

export const initializechatsocket = (server) => {
    const io = new socketIoserver(server, {})

    io.on('connection', async (socket) => {
        const userId = socket.handshake.query.userId

        await User.findByIdAndUpdate(userId, { SocketId: socket.id }).


        // video call socket
        socket.on("offer",(data,socketId)=>{
            socket.to(socketId).emit("offer",data)
        })

        socket.on("answere",(data,socketId)=>{
            socket.to(socketId).emit("answere",data)
        })

        socket.on("ice-candidate", (data,socketId) => {
            socket.to(socketId).emit("ice-candidate", data);
        });


        // sending friends to currunt user
        const friends = await User.findById(userId).populate("friends")
        io.to(socket.id).emit("getfriends", friends)

        socket.on("userSelected", async (selectedUserId) => {
            const reciverSocketId = await User.findById(selectedUserId).select("SocketId")
            socket.to(socket.id).emit("selectedUserSocketId", reciverSocketId)
        })

        //send message and image and store in database 
        socket.on("sendmesg", async (receiverId, message=null,media=null, selectedsocketId) => {
            try {

                const addchat = new Chat({ senderId: userId, receiverId, message,media })
                await addchat.save()

                io.to(selectedsocketId).emit("newmessage", message)
            } catch (err) {
                console.error(err)
            }
        })

        


        // ontyping animation when opposite user is typing
        socket.on("userTyping", async (receiverId) => {
            try {
                // Fetch the receiver's socket ID from the database
                const receiver = await User.findById(receiverId).select("SocketId");

                if (receiver && receiver.SocketId) {
                    io.to(receiver.SocketId).emit("usertyping", userId);
                }
            } catch (error) {
                console.error("Typing event error:", error);
            }
        });



        socket.on("messageRead", async (receiverId, messageId) => {
            try {
                await Chat.findByIdAndUpdate({
                    _id: messageId,
                    $or: [
                        { receiverId: receiverId, userId: userId },
                        { receiverId: userId, userId: receiverId }
                    ]
                }, { $set: { msgstatus: "read" } })
            } catch (error) {
                console.error("error in message read socket", error)
            }
        })


        socket.on("messageDelivered",async (receiverId,messageId)=>{
            try{
                await Chat.findByIdAndUpdate({
                    _id:messageId,
                    $or: [
                        { receiverId: receiverId, userId: userId },
                        { receiverId: userId, userId: receiverId }
                    ]
                },{$set:{msgstatus:"delivered"}})

            }catch(error){
                console.error("error in message read socket", error)
            }
        })

        


        // socket disconnection
        socket.on("disconnect", async () => {
            console.log(`User ${userId} is dissconnected`);
            await User.findByIdAndUpdate(userId, { SocketId: null })

        })
    })
}
