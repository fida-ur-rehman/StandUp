let io;

let onlineUsers = [];

const addNewUser = (username, socketId) => {
  !onlineUsers.some((user) => user.username === username) &&
  onlineUsers.push({ username, socketId });
  console.log("online Uers :", onlineUsers)
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  console.log("online Uers :", onlineUsers)
};

exports.socketConnection = (server) => {

  io = require('socket.io')(server,  {
    cors: { origin: "*" }
  });

    io.on("connection", (socket) => {
    addNewUser(socket.handshake.query._id, socket.id);

    socket.on('Activity', message => {
      console.log("a")
        io.to("abcd").emit('Activity', message);
    });

    socket.on("disconnect", function () {
        removeUser(socket.id);
        // delete onlineUsers[socket.id];
        
        console.log("User Disconnected", socket.id);
    });

    })
};


exports.sendMessage = (_activity) => {
    onlineUsers.map(user=>{
        // console.log(_activity.users.includes(user.username))
        if(_activity.users.includes(user.username)){
              io.to(user.socketId).emit("Activity", _activity);
        }
      })
};