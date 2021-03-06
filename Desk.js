//I'm not sure where this file goes but I'm taking it out of node modules for now lol (this was done after OG)

const EventEmitter = require('events');
const BrowserWindow = require('electron').remote.BrowserWindow;

let Desk = class Desk extends EventEmitter {
    constructor() {
        super();
        this.layers = [];
        this.draggableRegions = [];
        this.fps = 60;
        this.baseWidth = window.outerWidth;
        this.baseHeight = window.outerHeight;
        this.scale = 1;
        this.bgColor = "#ffffff";
        this.bgBoard = new Desk.Board(0, 0, window.outerWidth, window.outerHeight, -100);
        this.autoCenter = true;
        this.keys = [];
    }

    generateScale() {
        if (this.continuouslyScale) {
            let baseScale = this.baseHeight / this.baseWidth;
            let scaleDiff = baseScale - (window.outerHeight / window.outerWidth);
            if (scaleDiff < 0) {
                return window.outerWidth / this.baseWidth;
            } else {
                return window.outerHeight / this.baseHeight;
            }
        } else {
            return this.scale;
        }
    }

    addLayer(layer) {
        this.layers.push(layer);
    }

    getLayer(name) {
        for (let layer of this.layers) {
            if (layer.name == name) {
                return layer;
            }
        }
    }

    removeLayer(name) {
        for (let layer in this.layers) {
            if (this.layers[layer].name == name) {
                this.layers.slice(layer, 1);
                return layer;
            }
        }
    }

    getEntities(){
        let entities = [];
        for(let layer of this.layers){
            entities = entities.concat(layer.entities);
        }
        return entities;
    }

    listen() {
        let handleMouseEvent = event => {
            let type = event.type.replace("mouse", "");
            this.emit("mouse", type, event);
            let entities = [];
            for (let layer of this.layers) {
                entities = entities.concat(this.layerEntitiesOnPoint(layer, event.clientX, event.clientY)[0]);
            }
            for (let entity of entities) {
                entity.emit("mouse", type, event);
            }
        }

        document.addEventListener("mousedown", handleMouseEvent);
        document.addEventListener("mouseup", handleMouseEvent);
        document.addEventListener("mouseenter", handleMouseEvent);
        document.addEventListener("mouseexit", handleMouseEvent);
        document.addEventListener("click", handleMouseEvent);
        document.addEventListener("dblclick", handleMouseEvent);

        let handleMouseMove = event => {
            let sepEntities = [[], []];
            for (let layer of this.layers) {
                let entities = this.layerEntitiesOnPoint(layer, event.clientX, event.clientY);
                sepEntities[0] = sepEntities[0].concat(entities[0]);
                sepEntities[1] = sepEntities[1].concat(entities[1]);
            }
            for (let entity of sepEntities[0]) {
                entity.emit("mouse", "on", event);
            }
            for (let entity of sepEntities[1]) {
                entity.emit("mouse", "off", event);
            }
            this.emit("mouse", "move", event);
        }

        document.addEventListener("mousemove", handleMouseMove);

        let handleKey = event => {
            let type = event.type.replace("key", "");
            this.emit('key', type, event);
            if(type == 'down' && !this.keys.includes(event.key))
                this.keys.push(event.key);
            if(type == 'up')
                this.keys.splice(this.keys.indexOf(event.key), 1);
        }

        document.addEventListener('keydown', handleKey);
        document.addEventListener('keyup', handleKey);
        document.addEventListener('keypress', handleKey);
    }

    autoResize() {
        let resized;
        let handleResize = () => {
            clearTimeout(resized);
            resized = setTimeout(() => { this.correctSize(); }, 500);
        }
        window.addEventListener("resize", handleResize);
        this.continuouslyScale = true;
    }

    correctSize() {
        if (!BrowserWindow.getFocusedWindow().isMaximized()) {
            let baseScale = this.baseHeight / this.baseWidth;
            let scaleDiff = baseScale - (window.outerHeight / window.outerWidth);
            if (scaleDiff < 0) {
                window.resizeTo(window.outerWidth, Math.round(window.outerWidth * baseScale));
            }
            if (scaleDiff > 0) {
                window.resizeTo(Math.round(window.outerHeight * (this.baseWidth / this.baseHeight)), window.outerHeight);
            }
        }
    }

    start() {
        let loop = () => {
            setTimeout(() => {
                if (!this.stop) {
                    this.bgBoard.canvas.width = window.outerWidth;
                    this.bgBoard.canvas.height = window.outerHeight;
                    this.bgBoard.fill(this.bgColor);
                    for (let layer of this.layers) {
                        if (this.autoCenter) {
                            layer.canvas.style.left = window.outerWidth / 2 - layer.canvas.width / 2;
                        }
                        layer.setScale(this.generateScale());
                        this.paint(layer, layer.entities);
                    }
                    for (let region of this.draggableRegions) {
                        region.style.width = region.baseWidth * this.generateScale();
                        region.style.height = region.baseHeight * this.generateScale();
                    }
                    loop();
                }
            }, 1000 / this.fps);
        }
        loop();
    }

    entitiesOnPoint(entities, x, y) {
        let targetEntities = [];
        let otherEntities = [];
        for (let entity of entities) {
            let checkEntity = (entity, offsetX, offsetY) => {
                let flag = false;
                if (entity instanceof Desk.Shape) {
                    let ex = (entity.x + offsetX) * this.generateScale();
                    let ey = (entity.y + offsetY) * this.generateScale();
                    switch (entity.shape.constructor) {
                        case Desk.Board.Rect:
                            let ew = entity.shape.width * this.generateScale();
                            let eh = entity.shape.height * this.generateScale();
                            if (entity.shape.centered) {
                                ex -= ew / 2;
                                ey -= eh / 2;
                            }
                            if (
                                (ex < x && ex + ew > x) &&
                                (ey < y && ey + eh > y)
                            ) {
                                targetEntities.push(entity);
                                flag = true;
                            }
                            break;
                        case Desk.Board.Polygon: //nowhere near correct for things such as triangles; might be replace with a working method in the future
                        case Desk.Board.Circle:
                            let er = entity.shape.radius * this.generateScale();
                            if (entity.shape.centered) {
                                ex -= er / 2;
                                ey -= er / 2;
                            }
                            if (Math.sqrt((x - ex) * (x - ex) + (y - ey) * (y - ey)) < er) {
                                targetEntities.push(entity);
                                flag = true;
                            }
                            break;
                    }
                } else if (entity instanceof Desk.EntityGroup) {
                    for (let entity2 of entity.entities) {
                        checkEntity(entity2, entity.x, entity.y);
                    }
                }
                if (!flag)
                    otherEntities.push(entity);
            }
            checkEntity(entity);
        }
        return [targetEntities, otherEntities];
    }

    layerEntitiesOnPoint(layer, x, y) {
        return this.entitiesOnPoint(layer.entities, x - parseInt(layer.canvas.style.left.slice(0, -2)), y - parseInt(layer.canvas.style.top.slice(0, -2)));
    }

    paint(layer, entities, offsetX, offsetY, bg) {
        if ((bg == null || bg) && layer.bgColor != null) {
            layer.fill(layer.bgColor);
        }
        if (isNaN(offsetX)) {
            offsetX = 0;
        }
        if (isNaN(offsetY)) {
            offsetY = 0;
        }
        for (let entity of entities) {
            if (entity instanceof Desk.EntityGroup) {
                this.paint(layer, entity.entities, entity.x + offsetX, entity.y + offsetY, false);
            } else if (entity instanceof Desk.Shape) {
                layer.drawShape(entity.x + offsetX, entity.y + offsetY, entity.shape);
            }
        }
    }

    setDraggableRegion(x, y, w, h) {
        let region = document.createElement("div");
        region.baseWidth = w;
        region.baseHeight = h;
        region.style = '-webkit-app-region: drag;' +
            'position: fixed;' +
            'z-index: -1;' +
            `top: ${y};` +
            `left: ${x};` +
            `width: ${w};` +
            `height: ${h};`;
        document.body.appendChild(region);
        this.draggableRegions.push(region);
    }
}

Desk.Entity = class Entity extends EventEmitter {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }
}

Desk.Shape = class Shape extends Desk.Entity {
    constructor(x, y, shape, options) {
        super(x, y);
        for (let option in options) {
            shape[option] = options[option];
        }
        this.shape = shape;
    }
}

Desk.Button = class Button extends Desk.Shape {
    constructor(x, y, shape, options, defColor, hoverColor, pressColor, func) {
        super(x, y, shape, options);
        shape.color = defColor;
        this.on('mouse', (action, event) => {
            if (event.button == 0) {
                switch (action) {
                    case "on":
                        this.shape.color = hoverColor;
                        break;
                    case "up":
                        this.shape.color = hoverColor;
                        func();
                        break;
                    case "down":
                        this.shape.color = pressColor;
                        break;
                    case "off":
                        this.shape.color = defColor;
                        break;
                }
            }
        });
    }
}

Desk.EntityGroup = class EntityGroup extends Desk.Entity {
    constructor(x, y, entities) {
        super(x, y);
        this.entities = entities;
    }
}

/**
 * Basically a canvas for electron apps with extra functionality.
 * @class
 */
Desk.Board = class Board {
	/**
	 * Create's a canvas with context and adds it to the document automatically.
	 * @param {number} x - the canvas's fixed x value in the browser
	 * @param {number} y - the canvas's fixed y value in the browser
	 * @param {number} w - the canvas's width
	 * @param {number} h - the canvas's height
	 * @param {number} z - the z-index for the canvas's style
	 */
    constructor(x, y, w, h, z) {
        this.canvas = document.createElement("canvas");
        let canvas = this.canvas;
        canvas.width = w;
        canvas.height = h;

        let style = canvas.style;
        style.position = "fixed";
        style.left = x;
        style.top = y;
        style["z-index"] = z;

        this.ctx = canvas.getContext("2d");

        document.body.appendChild(canvas);

        this.scale = 1;
        this.baseWidth = w;
        this.baseHeight = h;
    }
	/**
	 * Sets the Board's scale, which is passed to ctx.scale when drawing things.
	 * This also resizes the canvas by multiplying the original width and height by it.
	 * @param {number} scale
	 */
    setScale(scale) {
        this.scale = scale;
        this.canvas.width = this.baseWidth * scale;
        this.canvas.height = this.baseHeight * scale;
    }
    //drawing methods

	/**
	 * This shouldn't be used externally; all of Board's draw functions use this, so use them instead.
	 * This uses properties of the shape to successfully run the draw function with things like rotation and scale.
	 * This also deals with filling and outlining the shape drawn
	 * @param {object} shape 
	 * @param {function} drawFunc 
	 */
    handleShape(shape, drawFunc) {
        let ctx = this.ctx;
        ctx.save();
        ctx.scale(this.scale, this.scale);
        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        if (shape.rotation != null) {
            ctx.translate(shape.x, shape.y);
            ctx.rotate(2 * Math.PI * shape.rotation);
            ctx.translate(-shape.x, -shape.y);
            drawFunc();
        } else {
            drawFunc();
        }
        if (shape.color != null) {
            ctx.strokeStyle = shape.color;
            ctx.fillStyle = shape.color;
            ctx.fill();
        }
        if (shape.outline != null) {
            if (shape.outline.width != null)
                ctx.lineWidth = shape.outline.width;
            if (shape.outline.color != null)
                ctx.strokeStyle = shape.outline.color;
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

	/**
	 * Draws a rectangle object to the screen. Use Board.Rect to create one.
	 * @param {object} rect 
	 */
    drawRect(rect) {
        let ctx = this.ctx;
        this.handleShape(rect, () => {
            if (rect.centered)
                ctx.rect(rect.x - rect.width / 2, rect.y - rect.height / 2, rect.width, rect.height);
            else
                ctx.rect(rect.x, rect.y, rect.width, rect.height);
        });
    }

	/**
	 * Draws a circle object to the screen. Use Board.Circle to create one.
	 * @param {object} circle 
	 */
    drawCircle(circle) {
        let ctx = this.ctx;
        this.handleShape(circle, () => {
            if (circle.centered)
                ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
            else
                ctx.arc(circle.x + circle.radius, circle.y + circle.radius, circle.radius, 0, 2 * Math.PI);
        });
    }

	/**
	 * Draws a line object to the screen. Use Board.Line to create one.
	 * @param {object} line 
	 */
    drawLine(line) {
        let ctx = this.ctx;
        this.handleShape({ x: line.x, y: line.y, outline: { color: line.color, width: line.width }, rotation: line.rotation }, () => {
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x + line.x2, line.y + line.y2);
        });
    }

	/**
	 * Draws a polygon object to the screen. Use Board.Polygon to create one.
	 * @param {object} polygon 
	 */
    drawPolygon(polygon) {
        let ctx = this.ctx;
        this.handleShape(polygon, () => {
            if (polygon.centered) {
                let x = polygon.x + polygon.radius * 2;
                let y = polygon.y + polygon.radius;
            } else {
                let x = polygon.x + polygon.radius;
                let y = polygon.y;
            }
            //keep rotating a point around the center and connect the dots
            let center = { x: polygon.x, y: polygon.y };
            let angle = 2 * Math.PI * 1 / polygon.sides;
            ctx.moveTo(x, y);
            for (let i = 0; i < polygon.sides; i++) {
                let x1 = x - center.x;
                let y1 = y - center.y;

                let x2 = x1 * Math.cos(angle) - y1 * Math.sin(angle);
                let y2 = x1 * Math.sin(angle) + y1 * Math.cos(angle);

                x = x2 + center.x;
                y = y2 + center.y;

                ctx.lineTo(x, y);
            }

        });
    }

	/**
	 * Draws a text object to the screen. Use Board.Text to create one.
	 * @param {object} text 
	 */
    drawText(text) {
        let ctx = this.ctx;
        this.handleShape(text, () => {
            ctx.font = text.font;
            ctx.strokeText(text.text, text.x, text.y);
        });
    }

	/**
	 * completely fills the canvas with the color.
	 * The color can be anything acceptable for canvas#fillStyle
	 * @param {string} color 
	 */
    fill(color) {
        let ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

	/**
	 * Draws one of Board's shapes to it's canvas based on the type of shape.
	 * @param {number} x 
	 * @param {number} y 
	 * @param {object} shape 
	 */
    drawShape(x, y, shape) {
        shape.x = x;
        shape.y = y;
        if (this["draw" + shape.constructor.name] != null)
            this["draw" + shape.constructor.name](shape);
        else
            console.error("The shape object " + shape + " is not valid! Please use a shape class provided by Board");
    }
}
//classes to construct shapes for drawShape; it makes it really easy for graphics handlers
/**
 * A rectangle that stores a width and height; used for drawShape.
 * @class
 */
Desk.Board.Rect = class Rect {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

/**
 * A circle that stores a radius; used for drawShape.
 */
Desk.Board.Circle = class Circle {
    constructor(radius) {
        this.radius = radius;
    }
}

/**
 * A line that stores a x and y; used for drawShape.
 * The x and y are added to the original x and y from drawShape to get the second point needed for a line.
 */
Desk.Board.Line = class Line {
    constructor(x2, y2) {
        this.x2 = x2;
        this.y2 = y2;
    }
}

/**
 * A polygon that stores a radius and amount of sides; used for drawShape.
 */
Desk.Board.Polygon = class Polygon {
    constructor(sides, radius) {
        this.sides = sides;
        this.radius = radius;
    }
}

/**
 * Text that stores a string and a font (for canvas.drawText); used for drawShape.
 */
Desk.Board.Text = class Text {
    constructor(text, font) {
        this.text = text;
        this.font = font;
    }
}

Desk.Layer = class Layer extends Desk.Board {
    constructor(name, x, y, w, h, z) {
        super(x, y, w, h, z);
        this.name = name;
        this.entities = [];
    }
}

module.exports = Desk;