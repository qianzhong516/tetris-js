$(function(){
    var board = new Board('#root'),
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

        piece.moveDown();

        if(!collide(piece.vertices, prevPos)) {
            clearTrace(prevPos);
            updatePos(piece); // update 2d array
            drawPiece(piece);
        }else {
            cancelLines(prevPos);
            piece = spawnPiece();
        }

        setTimeout(() => {
            perFrame();
        }, accelerating ? 50 : 500);

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
        let prevPos = piece.vertices;
        clearTrace(prevPos);

        if(e.key === 'ArrowLeft' || e.key === 'a') {
            piece.moveLeft();
            // revert positions if touches the wall
            if(touchSideWall(piece.vertices)) piece.moveRight();
        }else if(e.key === 'ArrowRight' || e.key === 'd') {
            piece.moveRight();
            if(touchSideWall(piece.vertices)) piece.moveLeft();
        }else if(e.key === 'ArrowDown' || e.key === 's') {
            if(!accelerating) accelerating = true;
        }else if(e.key === 'z') {
            piece.rotate();
        }

        drawPiece(piece);
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
            }, 100);
        }
    }

    function touchSideWall(vertices) {
        return vertices.find(vertex => vertex[1] < 0 || vertex[1] >= board.width);
    }
});