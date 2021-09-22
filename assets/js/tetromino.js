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
        
        color = '#f0f04f';
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
    for(let i = 0; i < this.vertices.length; i++) {
        let [x, y] = this.vertices[i];
        this.vertices[i] = [x + 1, y];
    }
}

Tetromino.prototype.moveLeft = function() {
    for(let i = 0; i < this.vertices.length; i++) {
        let [x, y] = this.vertices[i];
        this.vertices[i] = [x, y - 1];
    }
}

Tetromino.prototype.moveRight = function() {
    for(let i = 0; i < this.vertices.length; i++) {
        let [x, y] = this.vertices[i];
        this.vertices[i] = [x, y + 1];
    }
}

Tetromino.prototype.rotate = function() {
    // rotate by center point
    let [rX, rY] = this.vertices[1];
    this.vertices = this.vertices.map((vertex, i) => {
        if(i === 1) return vertex;
        let [x, y] = this.vertices[i];
        // rotating formula: https://bit.ly/2Zb4AUi
        // rotate by anti-clockwise 90 degrees
        let newX = - (y - rY) * Math.sin(Math.PI / 2) + rX;
        let newY = (x - rX) * Math.sin(Math.PI / 2) + rY;
        return [newX, newY];
    });
}