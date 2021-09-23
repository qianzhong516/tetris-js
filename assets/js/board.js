let Board = function(id) {

    // enforce new operator
    if(!(this instanceof Board)) {
        return new Board(...arguments);
    }

    var gameBoardClass = 'game-board',
        width = 10,
        height = 30,
        gridLen = 20,// px
        bg = '#F5F5DC',
        positions = [], // 2d array, a reference pointer
        startPos = {
            I: [2, 3], // x = 1 to avoid rotating beyond the edge
            J: [1, 4],
            L: [1, 4],
            O: [0, 4],
            S: [1, 4],
            T: [1, 4],
            Z: [1, 4]
        },
        dataGameBoardClass = 'data-game-board',
        dataBoardWidth = 5,
        dataBoardHeight = 2,
        dataBoardGridLen = 15,
        dataBoardBg = '#FFF',
        dataBoardstartPos = {
            I: [1, 0], // x = 1 to avoid rotating beyond the edge
            J: [0, 1],
            L: [0, 1],
            O: [0, 1],
            S: [0, 1],
            T: [0, 1],
            Z: [0, 1]
        },
        lines = 0,
        piece,
        drawPiece,
        updatePos,
        spawnPiece,
        clearTrace,
        getIndex,
        collide,
        cancelLines,
        renderAll,
        showNextPiece;
    
    collide = function(newVertices, piece) {
        // only detects bottom-side collision.
        // the piece should keep falling if there is side collision.
        for(let vertex of newVertices) {
            let [x0, y0] = vertex;

            // touches the bottom
            if(x0 >= height) return true;
        }

        // the piece bottom collides with other pieces
        let bottoms = piece.getBottomSides(height);
        let touchObstacleAtBottom = bottoms.find(vertex => positions[vertex[0]][vertex[1]]);
        if(touchObstacleAtBottom) return true;

        return false;
    }
        
    clearTrace = function(vertices) {
        for(let vertex of vertices) {
            let [x0, y0] = vertex;
            
            // update 2d array
            positions[x0][y0] = ''; 
            // clear prev trace
            let idx = getIndex(x0, y0, width);
            $($(`${id} .${gameBoardClass} .tgrid`).get(idx)).css({ background: bg });
        }
    }

    renderAll = function() {
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                let idx = getIndex(row, col, width);
                $($(`${id} .${gameBoardClass} .tgrid`).get(idx)).css({ background: positions[row][col] });
            }    
        }        
    }

    drawPiece = function(piece, boardWidth, boardSelector) {
        for(let vertex of piece.vertices) {
            let [x0, y0] = vertex;

            // update board
            let idx = getIndex(x0, y0, boardWidth);
            $($(`${id} .${boardSelector} .tgrid`).get(idx)).css({ background: piece.color });
        }
    }

    spawnPiece = function(forDisplay = false) {
        let pieceForDisplay, pieceForGame;
        let idx = Math.floor(Math.random() * Object.keys(startPos).length);
        let shape = Object.keys(startPos)[idx];

        if(forDisplay) {
            let [x, y] = dataBoardstartPos[shape];
            pieceForDisplay = new Tetromino(shape, x, y);
        }

        let [x, y] = startPos[shape];
        pieceForGame = new Tetromino(shape, x, y);

        if(pieceForDisplay) return [pieceForDisplay, pieceForGame];
        else return pieceForGame;
    }

    showNextPiece = function() {
        // clear the existing shape
        $(`${id} .${dataGameBoardClass} .tgrid`).css({ background: '#FFF' });

        let [pieceForDisplay, pieceForGame] = spawnPiece(true);
        drawPiece(pieceForDisplay, dataBoardWidth, dataGameBoardClass);
        return pieceForGame;
    }

    getIndex = function(x, y, width) {
        return x * width + y;
    }

    updatePos = function(piece) {
        for(let vertex of piece.vertices) {
            let [x, y] = vertex;
            positions[x][y] = piece.color;
        }
    }

    cancelLines = function(vertices) {
        // check lines that the piece takes over
        let checkedLines = [];
        let removedLines = [];

        outer: for(let vertex of vertices) {
            if(!checkedLines.includes(vertex[0])) {
                checkedLines.push(vertex[0]);

                for(let col of positions[vertex[0]]) {
                    if(!col) continue outer;
                }

                removedLines.push(vertex[0]);
            }
        }
        
        removedLines.sort((a, b) => a - b);
        for(let rowNum of removedLines) {
            // update 2d array
            positions.splice(rowNum, 1);
            positions.unshift(Array.from({ length: width }, () => ''));
            // update scores
            lines++;            
        }
    
        // update board
        renderAll();
    }

    ;(function init() {
        let elem = $(id),
            dataBoard = 
            $('<div/>')
            .addClass('data-board')
            .css({
                marginRight: 50
            });

        dataBoard.appendTo(elem);

        // draw data board
        dataBoard.html(`
            <div class="next"><h3>Next</h3></div>
            <div><h3>Scores</h3><p class="scores"></p></div>
            <div><h3>Lines</h3><p class="lines"></p></div>
        `)

        // draw next piece board
        drawGridBoard('.data-board .next', dataGameBoardClass, {
            width: dataBoardWidth, 
            height: dataBoardHeight, 
            gridLen: dataBoardGridLen, 
            bg: dataBoardBg
        });

        // draw main game board
        drawGridBoard(id, gameBoardClass, { 
            width, 
            height, 
            gridLen, 
            bg
        });

    })();

    function drawGridBoard(appendTo, className, options) {
        let { width, height, gridLen, bg } = options,
            elem = $(appendTo),
            boardWrapper = 
            $('<div/>')
            .addClass(className)
            .css({
                position: 'relative',
                width: width * gridLen,
                height: height * gridLen,
                background: bg,
                border: '1px solid #000'
            });

        // draw grids
        for (let row = 0; row < height; row++) {
            let rowMatrix = [];

            for (let col = 0; col < width; col++) {
                rowMatrix.push('');

                $('<div/>')
                .addClass('tgrid')
                .css({
                    position: 'absolute',
                    left: col * gridLen,
                    top: row * gridLen,
                    width: gridLen,
                    height: gridLen
                })
                .appendTo(boardWrapper);
            }         

            positions.push(rowMatrix);   
        }

        // draw dividers
        for (let row = 1; row < height; row++) {
                $('<div/>')
                .css({
                position: 'absolute',
                top: row * gridLen,
                width: width * gridLen,
                height: '1px',
                background: '#f2f2f2',
                }).appendTo(boardWrapper);     
        }

        for (let col = 1; col < width; col++) {
                $('<div/>')
                .css({
                position: 'absolute',
                left: col * gridLen,
                width: '1px',
                height: height * gridLen,
                background: '#f2f2f2',
                }).appendTo(boardWrapper);     
        }
        
        boardWrapper.appendTo(elem);
    }

    return {
        width,
        piece,
        clearTrace,
        drawPiece,
        spawnPiece,
        collide,
        positions,
        updatePos,
        cancelLines,
        showNextPiece,
        gameBoardClass
    };
}