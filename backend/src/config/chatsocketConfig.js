import { Server as socketIoserver } from "socket.io";
import User from "../models/user.js";
import Chat from "../models/chat.js";

export const initializechatsocket = (server) => {
    const io = new socketIoserver(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      })

    io.on('connection', async (socket) => {
        
        const userId = socket.handshake.query.userId
        console.log(`user:${userId} has been connected`);
        io.emit("online",{ [userId]: socket.id })
       
        await User.findByIdAndUpdate(userId, { SocketId: socket.id })


        // video call socket
        socket.on("offer", (offer, toSocketId) => {
            console.log("Relaying offer from", socket.id, "to", toSocketId);
            io.to(toSocketId).emit("offer", offer, socket.id);
          });
        
          socket.on("answer", (answer, toSocketId) => {
            console.log("Relaying answer from", socket.id, "to", toSocketId);
            io.to(toSocketId).emit("answer", answer);
          });
        
          socket.on("ice-candidate", (candidate, toSocketId) => {
            console.log("Relaying ICE candidate from", socket.id, "to", toSocketId);
            io.to(toSocketId).emit("ice-candidate", candidate);
          });
        
          socket.on("end-call", (toSocketId) => {
            console.log("Relaying end-call from", socket.id, "to", toSocketId);
            io.to(toSocketId).emit("end-call");
          });
        


        // sending friends to currunt user
        const friends = await User.findById(userId).populate("friends")
        io.to(socket.id).emit("getfriends", friends)

        socket.on("userSelected", async (selectedUserId) => {
            const reciverSocketId = await User.findById(selectedUserId).select("SocketId")
            socket.to(socket.id).emit("selectedUserSocketId", reciverSocketId)
        })

        //send message and image and store in database 
        socket.on("sendmessage", async (receiverId, message, selectedsocketId,media) => {
            try {

                let status='sent'
                    
                if(selectedsocketId){
                    status='delivered'
                }
                
                if(media){  
                    
                    io.to(selectedsocketId).emit("newmessage", media)
                    socket.emit("sentmessage",media)
                    io.to(selectedsocketId).emit("newmsgfrom", receiverId)
                }else{
                     
                    const addchat = new Chat({ senderId: userId, receiverId, message,media,msgstatus:status })
                    const newmessage=await addchat.save()
                    io.to(selectedsocketId).emit("newmessage", newmessage,socket.id)
                    socket.emit("sentmessage",newmessage)
                    io.to(selectedsocketId).emit("newmsgfrom", receiverId)

                }   
            } catch (err) {
                console.error(err)
            }
        })

        socket.on("statuschange", async (receiverId,selectedsocketId) => {
            try {                        
                    
                    await Chat.updateMany({ senderId: receiverId, receiverId:userId },{$set:{msgstatus:"read"}})
                    io.to(selectedsocketId).emit("msgread")
            } catch (err) { 
                console.error(err)
            }
        })

        


        // ontyping animation when opposite user is typing
        socket.on("userTyping", async (SocketId) => {
            try {
                
                if (SocketId) {
                    
                    io.to(SocketId).emit("userTyping");
                }
            } catch (error) {
                console.error("Typing event error:", error);
            }
        });

        socket.on("notTyping", async (SocketId) => {
            try {
                
                if (SocketId) {
                    
                    io.to(SocketId).emit("notTyping");
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
            await User.findByIdAndUpdate(userId,{ $set:{ SocketId: null,lastseen:new Date() }})
            io.emit("ofline", socket.id )
        })
    })
}
