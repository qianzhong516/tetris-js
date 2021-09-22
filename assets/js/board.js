let Board = function(id) {

    // enforce new operator
    if(!(this instanceof Board)) {
        return new Board(...arguments);
    }

    var width = 10,
        height = 30,
        gridLen = 20,// px
        bg = '#292929',
        positions = [], // 2d array
        startPos = {
            I: [1, 3], // x = 1 to avoid rotating beyond the edge
            J: [0, 4],
            L: [1, 4],
            O: [0, 4],
            S: [1, 4],
            T: [1, 4],
            Z: [1, 4]
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
        renderAll;
    
    collide = function(curr, prev) {
        for(let vertex of curr) {
            let [x0, y0] = vertex;

            // touches the bottom
            if(x0 >= height) return true;

            // collides with other pieces
            let self = prev.find(node => node[0] === x0 && node[1] === y0);
            if(positions[x0][y0] && !self) {
                return true;
            }
        }

        return false;
    }
        
    clearTrace = function(vertices) {
        for(let vertex of vertices) {
            let [x0, y0] = vertex;
            
            // update 2d array
            positions[x0][y0] = ''; 
            // clear prev trace
            let idx = getIndex(x0, y0);
            $($(`${id} .tgrid`).get(idx)).css({ background: bg });
        }
    }

    renderAll = function() {
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                let idx = getIndex(row, col);
                $($(`${id} .tgrid`).get(idx)).css({ background: positions[row][col] });
            }    
        }        
    }

    drawPiece = function(piece) {
        for(let vertex of piece.vertices) {
            let [x0, y0] = vertex;

            // update board
            let idx = getIndex(x0, y0);
            $($(`${id} .tgrid`).get(idx)).css({ background: piece.color });
        }
    }

    spawnPiece = function() {
        let idx = Math.floor(Math.random() * Object.keys(startPos).length);
        let shape = Object.keys(startPos)[idx];
        let [x, y] = startPos[shape];
        let p = new Tetromino(shape, x, y);
        updatePos(p);
        drawPiece(p);
        return p;
    }

    getIndex = function(x, y) {
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

        // update 2d array
        positions = positions.filter((_, rowNum) => !removedLines.includes(rowNum));

        for(let _ of removedLines) {
            positions.unshift(Array.from({ length: width }, () => ''));
            // update scores
            lines++;
        }

        // update board
        renderAll();
    }

    ;(function init() {
        let elem = $(id);
        let boardWrapper = 
            $('<div/>')
            .addClass('board')
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

    })();

    return {
        width,
        piece,
        clearTrace,
        drawPiece,
        spawnPiece,
        collide,
        positions,
        updatePos,
        cancelLines
    };
}