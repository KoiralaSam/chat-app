import express from "express";
import { createServer } from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "node:url";
import { Filter } from "bad-words";

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
  socket.emit("message", "Welcome!");
  socket.broadcast.emit("message", "A user has joined!");

  socket.on("disconnect", () => {
    io.emit("message", "A user has left");
  });

  socket.on("returnMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    io.emit("message", message);
    callback();
  });

  socket.on("sendLocation", ({ latitude, longitude }, callback) => {
    callback();
    io.emit(
      "locationMessage",
      `https://google.com/maps?q=${latitude},${longitude}`
    );
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
