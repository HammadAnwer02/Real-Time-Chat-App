const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const formatMessage = require(__dirname + "/utils/messages.js");
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  userLeaves,
} = require(__dirname + "/utils/users.js");

//set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatBot";

const io = socketio(server);

//run when a client connects

io.on("connection", function (socket) {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to Chatcord")); // to single client

    //broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, user.username + " has joined the chat")
      ); // emits to everyone but the sender

        //Send users and room info

        io.to(user.room).emit('roomUsers', {
            room : user.room,
            users: getRoomUsers(user.room)
        })

  });

  

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    console.log(user);
    //SEnd the message back
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
  socket.on("disconnect", () => {
    const user = userLeaves(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, user.username + " has left the chat")
      );
      io.to(user.room).emit('roomUsers', {
        room : user.room,
        users: getRoomUsers(user.room)
    })

    } else {
      console.log("No User found");
    }
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log("Server running on port ${port}");
});
