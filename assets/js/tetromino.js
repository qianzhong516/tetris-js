/**
 * 
 * @param {String} shape 
 * @param {Number} x - x position in 2d array
 * @param {Number} y - y position in 2d array
 */
let Tetromino = function(shape, x, y) {

    if(!shape) {
        throw new Error('Shape needs to be defined.');
    }

    if(x == undefined || x == null) {
        throw new Error('Starting x needs to be defined.');
    }

    if(y == undefined || y == null) {
        throw new Error('Starting y needs to be defined.');
    }

    // enforce new operator
    if(!(this instanceof Tetromino)) {
        return new Tetromino(...arguments);
    }

    // shapes reference: https://tetris.fandom.com/wiki/Tetromino
    // draw all shapes starts from the top-left/bottom-left point
    var startX = +x,
        startY = +y,
        vertices = [],
        color;

    vertices.push([startX, startY]);

    if(shape === 'I') {

        color = '#42e9f5';
        vertices.push([startX, startY + 1]);
        vertices.push([startX, startY + 2]);
        vertices.push([startX, startY + 3]);
        
    }else if(shape === 'J') {

        color = '#192ee6';
        vertices.push([startX + 1, startY]);
        vertices.push([startX + 1, startY + 1]);
        vertices.push([startX + 1, startY + 2]);

    }else if(shape === 'L') {
        
        color = '#f5b942';
        vertices.push([startX, startY + 1]);
        vertices.push([startX, startY + 2]);
        vertices.push([startX - 1, startY + 2]);

    }else if(shape === 'O') {
        
        color = '#f7de39';
        vertices.push([startX, startY + 1]);
        vertices.push([startX + 1, startY + 1]);
        vertices.push([startX + 1, startY]);

    }else if(shape === 'S') {

        color = '#80e650';
        vertices.push([startX, startY + 1]);
        vertices.push([startX - 1, startY + 1]);
        vertices.push([startX - 1, startY + 2]);

    }else if(shape === 'T') {

        color = '#b24fe3';
        vertices.push([startX, startY + 1]);
        vertices.push([startX, startY + 2]);
        vertices.push([startX - 1, startY + 1]);

    }else if(shape === 'Z') {

        color = '#e30e3c';
        vertices.push([startX, startY + 1]);
        vertices.push([startX + 1, startY + 1]);
        vertices.push([startX + 1, startY + 2]);
    }
    
    return {
        ...Tetromino.prototype,
        color,
        vertices,
        shape
    }
}

Tetromino.prototype.moveDown = function() {
    let newVertices = [];
    for(let i = 0; i < this.vertices.length; i++) {
        let [x, y] = this.vertices[i];
        newVertices.push([x + 1, y]);
    }
    return newVertices;
}

Tetromino.prototype.moveLeft = function() {
    let newVertices = [];
    for(let i = 0; i < this.vertices.length; i++) {
        let [x, y] = this.vertices[i];
        newVertices.push([x, y - 1]);
    }
    return newVertices;
}

Tetromino.prototype.moveRight = function() {
    let newVertices = [];
    for(let i = 0; i < this.vertices.length; i++) {
        let [x, y] = this.vertices[i];
        newVertices.push([x, y + 1]);
    }
    return newVertices;
}

Tetromino.prototype.rotate = function() {
    
    if(this.shape === 'O') return this.vertices;
    
    // rotate by center point
    let [rX, rY] = this.vertices[1];
    let newVertices = this.vertices.map((vertex, i) => {
        if(i === 1) return vertex;
        let [x, y] = this.vertices[i];
        // rotating formula: https://bit.ly/2Zb4AUi
        // rotate by anti-clockwise 90 degrees
        let newX = - (y - rY) * Math.sin(Math.PI / 2) + rX;
        let newY = (x - rX) * Math.sin(Math.PI / 2) + rY;
        return [newX, newY];
    });
    return newVertices;
}

Tetromino.prototype.selfContains = function(x, y) {
    return this.vertices.find(vertex => vertex[0] === x && vertex[1] === y);
}

Tetromino.prototype.getSurroundSides = function(boardWidth) {
    // get all the surrounding side slots of a tetromino
    let sides = [];

    for(let vertex of this.vertices) {
        // the surrounding sides do not include the piece itself, or beyond side walls
        let [x, y] = vertex;
        if(y + 1 < boardWidth && !this.selfContains(x, y + 1)) sides.push([x, y + 1]);
        if(y - 1 >= 0 && !this.selfContains(x, y - 1)) sides.push([x, y - 1]);
    }
    return sides;
}

Tetromino.prototype.getBottomSides = function(boardHeight) {
     // get all the surrounding bottom slots of a tetromino
    let bottoms = [];

    for(let vertex of this.vertices) {
        let [x, y] = vertex;
        if(x + 1 < boardHeight && !this.selfContains(x + 1, y)) bottoms.push([x + 1, y]);
    }
    return bottoms;
}