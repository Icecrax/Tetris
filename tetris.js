let canvas;
let ctx;

let gBArrayHeight = 20;
let gbArrayWidth = 12;

let tetrisLogo;
let winOrLose = 'Playing';
let score = 0;
let highScore;

let level = 1;
let numLines = 0;
let tolvlUp = 0;

let startX;
let startY;

let coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gbArrayWidth).fill(0)); // holds the coordinates of the individual squares of the game board 
let takenSquaresArray = [...Array(gBArrayHeight)].map(e => Array(gbArrayWidth).fill(undefined)); // keeps the colors of the taken squares
let nextTetrominoCoordArray = [...Array(4)].map(e => Array(4).fill(0)); // holds the coordinates of the individual squares of the display for the next tetromino  

let curTetromino;
let nextTetromino;
let tetrominos = [];

let curTetrominoColor;
let nextTetrominoColor;
let tetrominoColors = ['purple', 'cyan', 'blue', 'yellow', 'red', 'orange', 'green'];

let direction;
let DIRECTION = { IDLE: 0, DOWN: 1, LEFT: 2, RIGHT: 3 };

class Coordinates {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

document.addEventListener('DOMContentLoaded', SetupGame);

function SetupGame() {
    
    if (localStorage.getItem("tetrisHighScore") == null) {
        highScore = 0;
    } else {
        highScore = localStorage.getItem("tetrisHighScore");
    }

    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 470; 
    canvas.height = 480;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'white';
    ctx.strokeRect(8, 8, 280, 462);

    tetrisLogo = new Image(161, 54);
    tetrisLogo.onload = DrawTetrisLogo;
    tetrisLogo.src = 'tetrislogo.png';

    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.font = '21px Arial';

    ctx.fillText(winOrLose, 340, 93);
    ctx.strokeRect(300, 75, 161, 24);

    ctx.strokeRect(300, 110, 161, 90);

    ctx.fillText('LEVEL:', 310, 230);
    ctx.strokeRect(300, 210, 161, 24);
    ctx.fillText(level.toString(), 450 - (level.toString().length * 11), 230);

    ctx.fillText('SCORE:', 310, 265);
    ctx.strokeRect(300, 245, 161, 24);
    ctx.fillText(score.toString(), 450 - (score.toString().length * 11), 265);

    ctx.fillText('HIGH SCORE:', 310, 300);
    ctx.strokeRect(300, 280, 161, 54);
    ctx.fillText(highScore.toString(), 450 - (highScore.toString().length  * 11), 325);

    ctx.fillText('CONTROLS:', 320, 360);
    ctx.strokeRect(300, 366, 161, 104);
    ctx.fillText('A : Move Left', 310, 388);
    ctx.fillText('D : Move Right', 310, 413);
    ctx.fillText('S : Move Down', 310, 438);
    ctx.fillText('E : Rotate', 310, 463);

    document.addEventListener('keydown', HandleKeyPress);

    InitTetrominos();
    InitCoordArray();
    InitCoordArrayForNextTetremino();

    let randomPick = Math.floor(Math.random() * tetrominos.length);
    nextTetromino = tetrominos[randomPick];
    nextTetrominoColor = tetrominoColors[randomPick];
    ChooseNextTetromino();
    DrawNextTetromino();
    DrawCurrentTetromino();
}

function DrawTetrisLogo() {
    ctx.drawImage(tetrisLogo, 300, 8, 161, 54);
}

function InitTetrominos() {
    // T
    tetrominos.push([[1, 0], [0, 1], [1, 1], [2, 1]]);
    // I
    tetrominos.push([[0, 0], [1, 0], [2, 0], [3, 0]]);
    // J
    tetrominos.push([[0, 0], [0, 1], [1, 1], [2, 1]]);
    // O
    tetrominos.push([[0, 0], [1, 0], [0, 1], [1, 1]]);
    // L
    tetrominos.push([[2, 0], [0, 1], [1, 1], [2, 1]]);
    // S
    tetrominos.push([[1, 0], [2, 0], [0, 1], [1, 1]]);
    // Z
    tetrominos.push([[0, 0], [1, 0], [1, 1], [2, 1]]);
}

function InitCoordArray() {
    let i = 0, j = 0;
    for (let y = 9; y <= 9 + 23 * (gBArrayHeight - 1); y += 23) {
        for (let x = 11; x <= 11 + 23 * (gbArrayWidth - 1); x += 23) {
            coordinateArray[i][j] = new Coordinates(x, y);
            i++;
        }
        j++;
        i = 0;
    }
}

function InitCoordArrayForNextTetremino() {
    let i = 0, j = 0;
    for (let y = 129; y <= 129 + 23 * 2; y += 23) {
        for (let x = 341; x <= 341 + 23 * 3; x += 23) {
            nextTetrominoCoordArray[i][j] = new Coordinates(x, y);
            i++;
        }
        j++;
        i = 0;
    }
}

function ChooseNextTetromino() {
    // sets the current tetromino to the one expected to come
    startX = 4;
    startY = 0;
    direction = DIRECTION.IDLE;
    curTetromino = nextTetromino;
    curTetrominoColor = nextTetrominoColor;
    // picks a new random next one
    let randomTetromino = Math.floor(Math.random() * tetrominos.length);
    nextTetromino = tetrominos[randomTetromino];
    nextTetrominoColor = tetrominoColors[randomTetromino];
}

function DrawCurrentTetromino() {
    for (let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = curTetrominoColor;
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}

function DeleteCurrentTetromino() {
    for (let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = 'black';
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}

function DrawNextTetromino() {
    // Clear
    for (let y = 0; y < nextTetrominoCoordArray.length; y++) {
        for(let x = 0; x < nextTetrominoCoordArray[y].length; x++){
            let coorX = nextTetrominoCoordArray[x][y].x;
            let coorY = nextTetrominoCoordArray[x][y].y;
            ctx.fillStyle = 'black';
            ctx.fillRect(coorX, coorY, 21, 21);
        }        
    }

    // Draw
    for (let i = 0; i < nextTetromino.length; i++) {
        let x = nextTetromino[i][0];
        let y = nextTetromino[i][1];
        let coorX = nextTetrominoCoordArray[x][y].x;
        let coorY = nextTetrominoCoordArray[x][y].y;
        ctx.fillStyle = nextTetrominoColor;
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}

// Moves the tetromino down at an interval
window.setInterval(function () {
    if (winOrLose !== 'Game Over!') {
        direction = DIRECTION.DOWN;
        if (!CheckForVerticalCollision()) {
            DeleteCurrentTetromino();
            startY++;
            DrawCurrentTetromino();
        } else {
            if(!CheckForEndOfGame()){
                CheckForCompletedRows();
                ChooseNextTetromino();
                DrawNextTetromino();
                DrawCurrentTetromino();
            }
        }
    }
}, 920 - 80  * (level - 1));

function HandleKeyPress(key) {
    if (winOrLose !== 'Game Over!') {
        // A
        if (key.keyCode === 65) {
            direction = DIRECTION.LEFT;
            if (!CheckForHittingSideWall() && !CheckForHorizontalCollision()) {
                DeleteCurrentTetromino();
                startX--;
                DrawCurrentTetromino();
            }

        }
        // D
        else if (key.keyCode === 68) {
            direction = DIRECTION.RIGHT;
            if (!CheckForHittingSideWall() && !CheckForHorizontalCollision()) {
                DeleteCurrentTetromino();
                startX++;
                DrawCurrentTetromino();
            }
        }
        // S
        else if (key.keyCode === 83) {
            direction = DIRECTION.DOWN;
            if (!CheckForVerticalCollision()) {
                DeleteCurrentTetromino();
                startY++;
                DrawCurrentTetromino();
            } else {
                if(!CheckForEndOfGame()){
                    CheckForCompletedRows();
                    ChooseNextTetromino();
                    DrawNextTetromino();
                    DrawCurrentTetromino();
                }
            }
        }
        // E
        else if (key.keyCode === 69) {
            direction = DIRECTION.IDLE;
            if (!CheckForRotationCollision()) {
                RotateTetromino();
            }
        }
    }
}

function CheckForHittingSideWall() {
    for (let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        if (direction === DIRECTION.LEFT && x <= 0) return true;
        if (direction === DIRECTION.RIGHT && x >= gbArrayWidth - 1) return true;
    }
    return false;
}

function CheckForHorizontalCollision() {
    for (let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;

        if (direction === DIRECTION.LEFT) x--;
        if (direction === DIRECTION.RIGHT) x++;
        
        if (typeof takenSquaresArray[x][y] === 'string')
            return true;
    }
    return false;
}

function CheckForVerticalCollision() {
    for (let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
        if (y + 1 >= gBArrayHeight || typeof takenSquaresArray[x][y + 1] === 'string'){
            for (let j = 0; j < curTetromino.length; j++) {
                let x2 = curTetromino[j][0] + startX;
                let y2 = curTetromino[j][1] + startY;
                takenSquaresArray[x2][y2] = curTetrominoColor;
            }
            return true;  
        }        
    }
    return false;
}

function CheckForEndOfGame(){
    if (startY <= 2) {
        winOrLose = 'Game Over!'; 
        ctx.font = '20px Georgia';           
        ctx.fillStyle = 'black';
        ctx.fillRect(301, 76, 160, 23);
        ctx.fillStyle = 'red';
        ctx.fillText(winOrLose, 330, 94);
        return true;
    }
    else return false;
}

async function CheckForCompletedRows() {
    let rowsToDelete = 0;
    let startOfDeletion = 0;

    for (let y = 0; y < gBArrayHeight; y++) {
        let completed = true;
        for (let x = 0; x < gbArrayWidth; x++) {
            if(typeof takenSquaresArray[x][y] === 'undefined'){
                completed = false;
                break;
            }
        }
        
        if (completed) {
            if (startOfDeletion === 0){
                startOfDeletion = y;
            }
            rowsToDelete++;       
        }
    }
    if(rowsToDelete > 0){
        if (rowsToDelete < 4) {
            for (let y = startOfDeletion; y < startOfDeletion + rowsToDelete; y++) {
                for (let x = 0; x < gbArrayWidth; x++) {
                    takenSquaresArray[x][y] = undefined;
                    let coorX = coordinateArray[x][y].x;
                    let coorY = coordinateArray[x][y].y;
                    ctx.fillStyle = 'black';
                    ctx.fillRect(coorX, coorY, 21, 21);
                    await sleep(30);
                }
            }
            if(rowsToDelete === 1){
                score += (10 * level);        
            } else if (rowsToDelete === 2){
                score += (30 * level);     
            } else {
                score += (60 * level);
            }
              
        } else {
            for (let x1 = (gbArrayWidth / 2) - 1, x2 = gbArrayWidth / 2; x1 >= 0 && x2 < gbArrayWidth; x1--, x2++) {
                for(let y = startOfDeletion; y < startOfDeletion + rowsToDelete; y++){
                    ctx.fillStyle = 'black';

                    takenSquaresArray[x1][y] = undefined;
                    let coorX1 = coordinateArray[x1][y].x;
                    let coorY1 = coordinateArray[x1][y].y;
                    ctx.fillRect(coorX1, coorY1, 21, 21);

                    takenSquaresArray[x2][y] = undefined;
                    let coorX2 = coordinateArray[x2][y].x;
                    let coorY2 = coordinateArray[x2][y].y;
                    ctx.fillRect(coorX2, coorY2, 21, 21);
                }
                await sleep(50);
            }
            score += (100 * level);    
        }

        numLines += rowsToDelete;
        tolvlUp += rowsToDelete;
        if(tolvlUp >= 10 && level < 10){
            level++;
            tolvlUp %= 10;
        }

        // draws the score, highScore and level
        highScore = Math.max(score, highScore);
        localStorage.setItem("tetrisHighScore", highScore);
        ctx.fillStyle = 'black';
        ctx.fillRect(400, 246, 60, 21);
        ctx.fillRect(301, 305, 159, 23);
        ctx.fillRect(400, 211, 60, 21);
        ctx.fillStyle = 'white';
        ctx.fillText(score.toString(), 450 - (score.toString().length * 11), 265);
        ctx.fillText(highScore.toString(), 450 - (highScore.toString().length  * 11), 325);
        ctx.fillText(level.toString(), 450 - (level.toString().length * 11), 230);

        MoveAllRowsDown(rowsToDelete, startOfDeletion);
    }
}

function MoveAllRowsDown(rowsToDelete, startOfDeletion) {
    for (let y = startOfDeletion - 1; y >= 0; y--) {
        for (let x = 0; x < gbArrayWidth; x++) {
            let endOfDeletion = y + rowsToDelete;
            let curSquareColor = takenSquaresArray[x][y];
            let nextSquareColor = takenSquaresArray[x][endOfDeletion];
            if (typeof curSquareColor === 'string') {
                nextSquareColor = curSquareColor;
                takenSquaresArray[x][endOfDeletion] = curSquareColor;
                let coorX = coordinateArray[x][endOfDeletion].x;
                let coorY = coordinateArray[x][endOfDeletion].y;
                ctx.fillStyle = nextSquareColor;
                ctx.fillRect(coorX, coorY, 21, 21);

                takenSquaresArray[x][y] = undefined;
                coorX = coordinateArray[x][y].x;
                coorY = coordinateArray[x][y].y;
                ctx.fillStyle = 'black';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
}

function RotateTetromino() {
    let rotatedTetromino = new Array();
    for (let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0];
        let y = curTetromino[i][1];
        let newX = (GetLeftMostX() - y);
        let newY = x;
        rotatedTetromino.push([newX, newY]);
    }
    DeleteCurrentTetromino();
    curTetromino = rotatedTetromino;
    DrawCurrentTetromino();
}

function CheckForRotationCollision(){
    for (let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0];
        let y = curTetromino[i][1];
        let newX = (GetLeftMostX() - y) + startX;
        let newY = x + startY;

        if(newX < 0 || newX >= gbArrayWidth || newY < 0 || newY >= gBArrayHeight || typeof takenSquaresArray[newX][newY] === 'string')
            return true;
    }
    return false;
}

function GetLeftMostX() {
    let leftMostX = 0;
    for (let i = 0; i < curTetromino.length; i++) {
        let square = curTetromino[i];
        if (square[0] > leftMostX) {
            leftMostX = square[0];
        }
    }
    return leftMostX;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
