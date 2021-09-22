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
        piece,
        drawPiece,
        updatePos,
        spawnPiece,
        clearTrace,
        getIndex,
        collide;
    
    collide = function(curr, prev) {
        for(let vertex of curr) {
            let [x0, y0] = vertex;

            // touches the bottom
            if(x0 >= height) return true;

            // collides with other pieces
            let self = prev.find(node => node[0] === x0 && node[1] === y0);
            if(positions[x0][y0] && !self) {
                console.log(`positions[${x0}][${y0}]`)
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

    drawPiece = function(piece) {
        for(let vertex of piece.vertices) {
            let [x0, y0] = vertex;

            // update board
            let idx = getIndex(x0, y0);
            $($(`${id} .tgrid`).get(idx)).css({ background: piece.color });
        }
    }

    spawnPiece = function() {
        // random function here
        let [x, y] = startPos['Z'];
        let p = new Tetromino('Z', x, y);
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
        updatePos
    };
}