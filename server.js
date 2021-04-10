const e = require('express');
const express = require('express');
const { isBuffer } = require('util');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server, {
    cors: {
         origin: "https://messengerss.herokuapp.com",
       // origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
})
require('./socket/socket.io')(io);

server.listen(process.env.PORT || 1234, () => {
    console.log("server on port 1234");
})