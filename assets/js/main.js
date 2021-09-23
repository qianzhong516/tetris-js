$(function(){
    var board = new Board('#root'),
        positions = board.positions,
        spawnPiece = board.spawnPiece,
        clearTrace = board.clearTrace,
        drawPiece = board.drawPiece,
        collide = board.collide,
        updatePos = board.updatePos,
        cancelLines = board.cancelLines,
        accelerating = false;

    // start the game
    let piece = spawnPiece();

    setTimeout(function perFrame() {
        let prevPos = [...piece.vertices];

        let newVertices = piece.moveDown();

        if(!collide(newVertices, piece)) {
            piece.vertices = newVertices;
            clearTrace(prevPos);
            updatePos(piece); // update 2d array
            drawPiece(piece);
        }else {
            cancelLines(prevPos);
            piece = spawnPiece();
        }

        setTimeout(() => {
            perFrame();
        }, accelerating ? 50 : 300);

    }, 0);

    let kdHandler = thresholder(keydownHandler);
    $(document).on('keydown', kdHandler);
    $(document).on('keyup', keyupHandler);

    function keyupHandler(e) {
        if(e.key === 'ArrowDown' || e.key === 's') {
            accelerating = false;
        }
    }

    function keydownHandler(e) {
        let prevPos = [...piece.vertices];
        let oldPiece = {...piece};

        if(e.key === 'ArrowLeft' || e.key === 'a') {
            let newVertices = piece.moveLeft();
            if(!touchObstacleOnSides(newVertices, piece)) {
                piece.vertices = newVertices;
            }

        }else if(e.key === 'ArrowRight' || e.key === 'd') {
            let newVertices = piece.moveRight();
            if(!touchObstacleOnSides(newVertices, piece)) piece.vertices = newVertices;

        }else if(e.key === 'ArrowDown' || e.key === 's') {
            if(!accelerating) accelerating = true;

        }else if(e.key === 'z') {
            piece.vertices = piece.rotate();
            // revert positions if goes beyond the side walls
            revertPositions(piece);
        }

        // update the board immediately after pressing a key
        // if collision is found, do not act immediately to leave some time for player's 'final movement'
        if(!collide(piece.vertices, oldPiece)) {
            clearTrace(prevPos);
            drawPiece(piece);
            updatePos(piece);
        }

    }

    function thresholder(f) {
        let doNothing = false;

        return function(...args) {
            if(doNothing) return;
           
            f.apply(this, args);
            doNothing = true;

            setTimeout(function() {
                doNothing = false;
            }, 50);
        }
    }

    function touchObstacleOnSides(newVertices, piece) {
        let sides = piece.getSurroundSides(board.width);
        let touchOtherPiece = sides.find(vertex => positions[vertex[0]][vertex[1]]);
        return touchOtherPiece || newVertices.find(vertex => vertex[1] < 0 || vertex[1] >= board.width);
    }

    function revertPositions(piece) {
        let revertDir,
            moves,
            beyondLeft = [],
            beyondRight = [];

        piece.vertices.forEach(vertex => {
            if(vertex[1] < 0) beyondLeft.push(vertex[1] * (-1));
        });

        piece.vertices.forEach(vertex => {
            if(vertex[1] >= board.width) beyondRight.push(vertex[1] - (board.width - 1));
        });

        if(beyondLeft.length) {
            // goes beyond the left-side wall
            revertDir = 'right';
            moves = Math.max(...beyondLeft);
        }else if(beyondRight.length) {
            // goes beyond the right-side wall
            revertDir = 'left';
            moves = Math.max(...beyondRight);
        }

        if(revertDir && moves) {
            for(let i = 0; i < moves; i++) {
                if(revertDir === 'left') {
                    piece.vertices = piece.moveLeft();
                }else if(revertDir === 'right'){
                    piece.vertices = piece.moveRight();
                }
            }
        }

    }
});