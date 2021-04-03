function findPlayerWin(rooms, value) {
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            if (rooms[value.roomIndex].data[i][j].value === "x") {
                const results = checkWin(rooms, value, "x", i, j);
                if (results) {
                    return results;
                }

            } else if (rooms[value.roomIndex].data[i][j].value === "o") {
                const results = checkWin(rooms, value, "o", i, j);
                if (results) {
                    return results;
                }
            }
        }
    }
}
function checkWin(rooms, value, type, i, j) {
    let dem = 0;
    let itemp = i, jtemp = j;
    try {
        //check ngang;
        while (dem < 5) {
            if (rooms[value.roomIndex].data[itemp][jtemp].value === type) {
                dem++;
                jtemp++;
            } else {
                break;
            }
        }
        if (dem >= 5) {
            return { dem: dem, type: type }
        }

    } catch { }
    try {
        //check dọc;
        dem = 0, checkLine = -1;
        itemp = i, jtemp = j;
        while (dem < 5) {
            if (rooms[value.roomIndex].data[itemp][jtemp].value === type) {
                dem++;
                itemp++;
            } else {
                break;
            }
        }
        if (dem >= 5) {
            return { dem: dem, type: type };
        }
    } catch { }
    try {
        //check chéo chính
        dem = 0; checkLine = -1;
        itemp = i, jtemp = j;
        while (dem < 5) {
            if (rooms[value.roomIndex].data[itemp][jtemp].value === type) {
                dem++;
                itemp++; jtemp++;
            } else {
                break;
            }
        }
        if (dem >= 5) {
            return { dem: dem, type: type };
        }
    } catch { }
    try {
        //check chéo phụ
        dem = 0; checkLine = -1;
        itemp = i, jtemp = j;
        while (dem < 5) {
            if (rooms[value.roomIndex].data[itemp][jtemp].value === type) {
                dem++;
                itemp++; jtemp--;
            } else {
                break;
            }
        }
        if (dem >= 5) {
            return { dem: dem, type: type };
        }
    } catch { }
    //kết thúc
}

module.exports = {
    findPlayerWin,
    checkWin

}