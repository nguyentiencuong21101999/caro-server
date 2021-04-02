const express = require('express');
const { isBuffer } = require('util');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server, {
    cors: {
        // origin: "https://messengerss.herokuapp.com",
        origin: "http://localhost:3000",
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

let createChess = () => {
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
    return newData;

}

io.on("connection", async (socket) => {
    socket.on("create-rooms", data => {
        socket.join(data + "caro");
        socket.join(roomsAll);
        io.in(data + "caro").emit('request-data-rooms', rooms)
    })

    userOnline.push(socket.id)
    io.emit("userOnline", userOnline)



    socket.on('join-rooms', (data) => {
        let numberPlayer = rooms[data.roomIndex].player.length;
        if (numberPlayer === 2) {
            io.in(data.name + "caro").emit("request-join-rooms", { result: false })
        } else if (numberPlayer === 0) {
            rooms[data.roomIndex].player.push({
                socketId: socket.id,
                name: data.name,
                info: data.info,
                type: x
            })
            io.in(data.name + "caro").emit("request-join-rooms", {
                rooms: rooms,
                result: true,
                currentRoom: data.roomIndex,
                type: x
            }
            )
            socket.to(roomsAll).emit('update-rooms', rooms)
        } else {
            rooms[data.roomIndex].player.push({
                socketId: socket.id,
                name: data.name,
                info: data.info,
                type: o

            })
            io.in(data.name + "caro").emit("request-join-rooms", {
                rooms: rooms,
                result: true,
                currentRoom: data.roomIndex,
                type: o
            }
            )
            socket.to(roomsAll).emit('update-rooms', rooms)
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

        }
    })

    socket.on('set-value-chess', (value) => {
        let user = rooms[value.roomIndex].player;
        const pos = user.map(function (e) { return e.socketId; }).indexOf(socket.id);
        const type = user[pos].type;
        let currentRoom = rooms[value.roomIndex];
        currentRoom.data[value.row][value.col].value = type;

        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if (rooms[value.roomIndex].data[i][j].value === "x") {
                    // if(checkWin(0,i,j)>=5){
                    //     fillColorLine(checkLine,i,j);
                    //     player = 0;

                    // }
                    let dem = 0;
                    let itemp = i, jtemp = j;
                    try {
                        //check ngang;
                        while (dem < 5) {
                            if (rooms[value.roomIndex].data[itemp][jtemp].value === "x") {
                                dem++;
                                jtemp++;
                                console.log(dem);
                            } else {
                                break;
                            }
                        }
                        if (dem >= 5) {
                            console.log(dem);
                            return dem;
                        }
                      
                    } catch { }
                }
                else if (rooms[value.roomIndex].data[i][j] === "o") {

                    // if(checkWin(1,i,j)>=5){
                    //     fillColorLine(checkLine,i,j);
                    //     player = 1;
                    // }
                }
            }
        }
        currentRoom.player.forEach(player => {
            // currentRoom.data[value.row][value.col].value = value.type
            io.sockets.in(player.socketId).emit("request-set-value-chess", currentRoom.data)
        });
    })
    socket.on('leave-rooms', data => {

        const player = rooms[data.roomIndex].player;
        player.map(element => {
            if (element.socketId === socket.id) {
                const pos = player.map(function (e) { return e.socketId; }).indexOf(socket.id);
                player.splice(pos, 1)
                io.in(roomsAll).emit('update-rooms', rooms)
            }
        })
        if (rooms[data.roomIndex].player.length > 0) {
            if (rooms[data.roomIndex].player[0].type === "o") {
                rooms[data.roomIndex].player[0].type = "x";
                io.in(rooms[data.roomIndex].player[0].name + "caro").emit('update-rooms', rooms)

            }
            const results = createChess();
            rooms[data.roomIndex].data = results;
            io.in(rooms[data.roomIndex].player[0].name + "caro").emit('set-value-chess', false)
        }


    })

    socket.on("disconnect", () => {
        userOnline.splice(userOnline.indexOf(socket.id), 1); //xóa phần tử trong mảng = indexOf(pt trong mang);
        let roomIndex = -1;
        rooms.map(roomss => {
            roomIndex = roomIndex + 1;
            if (roomss.player.length > 0) {
                roomss.player.map(player => {
                    if (player.socketId === socket.id) {
                        const pos = roomss.player.map(function (e) { return e.socketId; }).indexOf(socket.id);
                        roomss.player.splice(pos, 1)
                    }
                    if (roomss.player.length > 0) {
                        console.log("a");
                        if (roomss.player[0].type === "o") {
                            roomss.player[0].type = "x";
                            io.in(roomss.player[0].name + "caro").emit('update-rooms', rooms)
                            io.in(roomss.player[0].name + "caro").emit('set-value-chess', false)
                            const results = createChess();
                            roomss.data = results;
                        }
                    }
                })
            }

        })
        io.in(roomsAll).emit('update-rooms', rooms)
    })
})

server.listen(process.env.PORT || 1234, () => {
    console.log("server on port 1234");
})