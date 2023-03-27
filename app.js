const express = require("express");
const app = express();
const http = require("http");
const bodyParser = require("body-parser");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let roomsArray = require("./rooms.json");
const fs = require("fs");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/test", function (req, res) {
  res.render("test");
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/admin", (req, res) => {
  res.render("admin", { frontEndRooms: roomsArray });
});

app.get("/admin/:roomName", (req, res) => {
  const message = "";

  const name = req.params.roomName;
  const foundRoom = roomsArray.find((object) => {
    return object.name === name;
  });

  res.render("edit", {
    frontEndfoundRoom: foundRoom,
    frontEndMessage: message,
    changed: false,
  });
});

app.get("/rooms", function (req, res) {
  res.render("rooms", { frontEndRooms: roomsArray });
});

app.get("/rooms/:roomName", (req, res) => {
  let roomName = req.params.roomName;
  roomName = roomName.toString();
  // console.log("The room name found is " + roomName);
  const foundRoom = roomsArray.find((object) => {
    return object.name === roomName;
  });
  res.render("room", { frontEndfoundRoom: foundRoom });
});

app.post("/rooms/:name", function (req, res) {
  console.log(req.body);
  const roomName = req.body.name;
  const occupants = req.body.occupants;
  const numberSent = req.body.number;
  const jsonFileDir = "./rooms.json";

  console.log("Occupants constant contains: " + occupants);
  console.log("Number Sent constant contains: " + numberSent);

  jsonReader(jsonFileDir, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("The data variable contains" + data);
      const index = data.findIndex((object) => {
        return object.number === numberSent;
      });
      // console.log("The index is: " + index);
      data[index].occupants = occupants;
      fs.writeFile(jsonFileDir, JSON.stringify(data, null, 2), (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });

  const foundRoom = roomsArray.find((object) => {
    return object.name === roomName;
  });

  res.render("edit", {
    frontEndfoundRoom: foundRoom,
    changed: true,
  });
});

io.on("connection", (socket) => {
  socket.on("edit room", (msg) => {
    io.emit("edit room", msg);
  });
});

server.listen(3000, () => {
  console.log("Server started listening on port 3000");
});

function jsonReader(filePath, cb) {
  fs.readFile(filePath, "utf-8", (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}

app.get("*", function (req, res) {
  res.render("error");
});
