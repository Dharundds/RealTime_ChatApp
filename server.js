const path  = require("path")
const express = require('express');
const http = require('http');
const socketio  =require('socket.io')
const app = express();
const server = http.createServer(app)
const io = socketio(server)
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser,userLeave,getRoomUsers } = require('./utils/users');

// Set static folder 
app.use(express.static(path.join(__dirname,'public')));
const botName= 'bot';
// Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room)
        socket.join(user.room);

        //Welcome current user
        socket.emit('message',formatMessage(botName,'Welcome to ChatCord'));
        
        //Broadcast when user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,` ${username} has joined the chat`));
    
        io.to(user.room).emit('roomusers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });
    // Listen for chatMessage
    socket.on('chatMessage',msg =>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })
    
    // Runs when client disconnects
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if (user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));

            io.to(user.room).emit('roomusers',{
                room:user.room,
                users:getRoomUsers(user.room)
            });
        }
    })
});

const PORT = 3000 || process.env.PORT;


server.listen(PORT, ()=> console.log(`server running on port ${PORT}`));