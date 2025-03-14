import express from "express";
import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "node:url";
import { Filter } from "bad-words";
import locationMessage from "./utils/locationMessages.js";
import generateMessage from "./utils/messages.js";
import { addUser, removeUser, getUser, getUsersInRoom } from "./utils/users.js";

const app = express();
const server = createServer(app);

import { Server } from "socket.io";
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDirPath = join(__dirname, "../public");

app.use(express.static(publicDirPath));

const port = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log("New websocket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage({ username: "Admin", text: "welcome!" })
    );

    socket.broadcast.to(user.room).emit(
      "message",
      generateMessage({
        username: "Admin",
        text: `${user.username} has joined!`,
      })
    );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage({
          username: "Admin",
          text: `${user.username} has left`,
        })
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("returnMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    io.to(user.room).emit(
      "message",
      generateMessage({ username: user.username, text: message })
    );
    callback();
  });

  socket.on("sendLocation", (locationObject, callback) => {
    const user = getUser(socket.id);
    callback();
    io.to(user.room).emit(
      "locationMessage",
      locationMessage({ username: user.username, ...locationObject })
    );
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
