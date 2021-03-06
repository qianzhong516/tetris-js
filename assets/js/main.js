$(function(){
    var board = new Board('#root'),
        boardWidth = board.width,
        positions = board.positions,
        getLevel = board.getLevel,
        spawnPiece = board.spawnPiece,
        clearTrace = board.clearTrace,
        drawPiece = board.drawPiece,
        collide = board.collide,
        updatePos = board.updatePos,
        removeLines = board.removeLines,
        showNextPiece = board.showNextPiece,
        gameBoardClass = board.gameBoardClass,
        accelerating = false,
        stopFrame = false,
        piece,
        nextPiece,
        timer;

    // start the game
    piece = spawnPiece();
    updatePos(piece);
    drawPiece(piece, boardWidth, gameBoardClass);
    nextPiece = showNextPiece();

    timer = setTimeout(function perFrame() {

        if(!stopFrame) {
            let prevPos = [...piece.vertices];
            let newVertices = piece.moveDown();
    
            if(!collide(newVertices, piece)) {
                piece.vertices = newVertices;
                clearTrace(prevPos);
            }else {
                removeLines(prevPos);
                piece = nextPiece;
                nextPiece = showNextPiece();

                if(gameOver()) {
                    clearTimeout(timer);
                    alert('Game over!');
                    return;
                }
            }
    
            updatePos(piece);
            drawPiece(piece, boardWidth, gameBoardClass);
        }

        let freq = 500 - getLevel() * 50;
        if(freq > 0) {
            setTimeout(() => {
                perFrame();
            }, accelerating ? 50 : freq);
        }else {
            clearTimeout(timer);
            alert('You are unbeatable!');
        }

    }, 0);

    let kdHandler = thresholder(keydownHandler);
    $(document).on('keydown', kdHandler);
    $(document).on('keyup', keyupHandler);

    function keyupHandler(e) {
        stopFrame = false;
        if(e.key === 'ArrowDown' || e.key === 's') {
            accelerating = false;
        }
    }

    function keydownHandler(e) {
        let prevPos = [...piece.vertices];
        let oldPiece = {...piece};
        clearTrace(prevPos);

        if(e.key === 'ArrowLeft' || e.key === 'a') {
            let newVertices = piece.moveLeft();
            if(!touchObstacleOnSides(newVertices, piece)) piece.vertices = newVertices;
            
        }else if(e.key === 'ArrowRight' || e.key === 'd') {
            let newVertices = piece.moveRight();
            if(!touchObstacleOnSides(newVertices, piece)) piece.vertices = newVertices;

        }else if(e.key === 'ArrowDown' || e.key === 's') {
            if(!accelerating) accelerating = true;

        }else if(e.key === 'z') {
            stopFrame= true;
            piece.vertices = piece.rotate();
            // revert positions if goes beyond the side walls
            revertPositions(piece);

            // prevent the piece rotates onto other pieces
            let overlapOtherPiece = piece.vertices.find(vertex => positions[vertex[0]][vertex[1]] && !oldPiece.selfContains(vertex[0], vertex[1]));
            if(overlapOtherPiece) piece.vertices = prevPos;
        }

        // update the board immediately after pressing a key
        // do not act to collision immediately to leave some time for player's 'final movement'
        drawPiece(piece, boardWidth, gameBoardClass);
        updatePos(piece);

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
        let sides = piece.getSurroundSides(boardWidth);
        let touchOtherPiece = sides.find(vertex => positions[vertex[0]][vertex[1]]);
        return touchOtherPiece || newVertices.find(vertex => vertex[1] < 0 || vertex[1] >= boardWidth);
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
            if(vertex[1] >= boardWidth) beyondRight.push(vertex[1] - (boardWidth - 1));
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

    function gameOver() {
        return positions[0].find(value => value !== '');
    }
});