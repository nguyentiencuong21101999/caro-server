const express = require('express');
const { isBuffer } = require('util');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server, {
    cors: {
          origin: "https://messengerss.herokuapp.com",
        //origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
})
var roomsAll = "caro";
const x = "x";
const o = 'o';
let rooms = [];
let userOnline = [];
for (let rowNumber = 0; rowNumber < 12; rowNumber++) {
    let newRooms = {
        roomName: rowNumber,
        numberPlayer: 0,
        player: [],
        data: []
    }
    let newData = [];
    for (let row = 0; row < 20; row++) {
        let newRow = [];
        for (let col = 0; col < 20; col++) {
            newRow.push({
                row: row,
                col: col,
                value: ""
            })

        }
        newData.push(newRow)
    }
    newRooms.data = newData;
    rooms.push(newRooms)
}
io.on("connection", async (socket) => {
    socket.on("create-rooms", data => {
        socket.join(data + "caro");
        socket.join(roomsAll);
        io.in(data+"caro").emit('request-data-rooms', rooms)
    })





    userOnline.push(socket.id)
    io.emit("userOnline", userOnline)



    socket.on('joinRoom', (data) => {

        let numberPlayer = rooms[data.roomIndex].player.length;
        if (numberPlayer === 2) {
            socket.emit("joinRoomResults", { result: false })
        } else if (numberPlayer === 0) {
            rooms[data.roomIndex].player.push({
                socketId: socket.id,
                type: x

            })
            io.emit('updateRoom', rooms)

            socket.emit("joinRoomResults", {
                rooms: rooms,
                result: true,
                currentRoom: data.roomIndex,
                type: x
            }
            )
        } else {
            rooms[data.roomIndex].player.push({
                socketId: socket.id,
                type: o

            })
            io.emit('updateRoom', rooms)

            socket.emit("joinRoomResults", {
                rooms: rooms,
                result: true,
                currentRoom: data.roomIndex,
                type: o
            }
            )
        }
    })

    socket.on('setValue', (value) => {
        let currentRoom = rooms[value.roomIndex];
        currentRoom.data[value.row][value.col].value = x;
        currentRoom.player.forEach(player => {
            currentRoom.data[value.row][value.col].value = value.type
            io.sockets.in(player.socketId).emit("gameData", currentRoom.data)
        });
    })

    socket.on('leaveRoom', data => {
        const player = rooms[data.roomIndex].player
        player.map(element => {
            if (element.type === data.type) {
                player.splice(player.indexOf(element.socketId), 1)
            }

        })
        io.emit('updateRoom', rooms)
    })

    socket.on("disconnect", () => {
        userOnline.splice(userOnline.indexOf(socket.id), 1); //xóa phần tử trong mảng = indexOf(pt trong mang);

        rooms.map(rooms => {
            if (rooms.player.length > 0) {
                rooms.player.map(player => {
                    if (player.socketId === socket.id) {
                        rooms.player.splice(rooms.player.indexOf(socket.id), 1)
                    }

                })
            }

        })
        io.emit('updateRoom', rooms)

    })
})

server.listen(process.env.PORT || 1234, () => {
    console.log("server on port 1234");
})