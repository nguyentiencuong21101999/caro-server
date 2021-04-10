const { createChess, findPlayerWin } = require("../helper/caro")
var roomsAll = "caro";
const x = "x";
const o = 'o';
let rooms = [];
let userOnline = [];
for (let rowNumber = 0; rowNumber < 12; rowNumber++) {
    let newRooms = {
        roomName: rowNumber,
        ready: [],
        player: [],
        data: []
    }
    let newData = [];
    for (let row = 0; row < 15; row++) {
        let newRow = [];
        for (let col = 0; col < 17; col++) {
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
module.exports = (io) => {
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

        socket.on('set-value-chess', async (value) => {
            let players = true;
            if (value.currentType === x) {
                players = o;
            } else {
                players = x;
            }
            let user = rooms[value.roomIndex].player;
            const pos = user.map(function (e) { return e.socketId; }).indexOf(socket.id);
            const type = user[pos].type;
            let currentRoom = rooms[value.roomIndex];
            if (currentRoom.data[value.row][value.col].value === "") {
                currentRoom.data[value.row][value.col].value = type;
                currentRoom.player.forEach(async player => {
                    await io.sockets.in(player.socketId).emit("request-set-value-chess", currentRoom.data)
                    await io.sockets.in(player.socketId).emit("request-set-player", players)
                });
            }

            const results = findPlayerWin(rooms, value);
            if (results) {
                if (results.dem >= 5 && results.type === "x") {
                    user.forEach(element => {
                        if (element.type === results.type) {
                            const values = {
                                message: element.info.fullname + "  thắng !!!",
                                setValue: false
                            }
                            currentRoom.player.forEach(player => {
                                io.sockets.in(player.socketId).emit("send-user-win", values)
                            })
                            const results = createChess();
                            currentRoom.data = results;
                        }
                    })

                } else {
                    if (results.dem >= 5 && results.type === "o") {
                        user.forEach(element => {
                            if (element.type === results.type) {
                                const values = {
                                    message: element.info.fullname + "  thắng !!!",
                                    setValue: false
                                }
                                currentRoom.player.forEach(player => {
                                    io.sockets.in(player.socketId).emit("send-user-win", values)
                                })
                                const results = createChess();
                                currentRoom.data = results;
                            }
                        })

                    }
                }
            }

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
        socket.on("ready", data => {
            rooms[data.roomIndex].player.forEach(player => {
                // currentRoom.data[value.row][value.col].value = value.type
                io.sockets.in(player.socketId).emit("request-ready", data.name)
            });
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
                            if (roomss.player[0].type === "o") {
                                roomss.player[0].type = "x";
                                io.in(roomss.player[0].name + "caro").emit('update-rooms', rooms)

                            }
                            io.in(roomss.player[0].name + "caro").emit('set-value-chess', false)
                            const results = createChess();
                            roomss.data = results;
                        }
                    })
                }

            })
            io.in(roomsAll).emit('update-rooms', rooms)
        })
    })
}