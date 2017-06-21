const EventEmitter = require('events');
let Desk = class Desk extends EventEmitter {
    constructor() {
        super();
        this.layers = [];
        this.fps = 60;
    }

    addLayer(layer) {
        this.layers.push(layer);
    }

    getLayer(name) {
        for(let layer of this.layers){
            if(layer.name == name){
                return layer;
            }
        }
    }

    removeLayer(name) {
        for(let layer in this.layers){
            if(this.layers[layer].name == name){
                this.layers.slice(layer, 1);
                return layer;
            }
        }
    }

    getAllEntities() {
        let all = [];
        for (let layer of this.layers) {
            all = all.concat(layer.entities);
        }
        return all;
    }

    listen() {
        let handleMouseEvent = event => {
            let type = event.type.replace("mouse", "");
            for (let entity of this.entitiesOnPoint(this.getAllEntities(), event.clientX, event.clientY)[0]) {
                entity.emit("mouse", type, event);
            }
        }

        let handleMouseMove = event => {
            let sepEntities = this.entitiesOnPoint(this.getAllEntities(), event.pageX, event.pageY);
            for (let entity of sepEntities[0]) {
                entity.emit("mouse", "on", event);
            }
            for (let entity of sepEntities[1]) {
                entity.emit("mouse", "off", event);
            }
        }

        document.addEventListener("mousedown", handleMouseEvent);
        document.addEventListener("mouseup", handleMouseEvent);
        document.addEventListener("mouseenter", handleMouseEvent);
        document.addEventListener("mouseexit", handleMouseEvent);
        document.addEventListener("click", handleMouseEvent);
        document.addEventListener("dblclick", handleMouseEvent);
        document.addEventListener("mousemove", handleMouseMove);
    }

    start() {
        let loop = () => {
            setTimeout(() => {
                if (!this.stop) {
                    for (let layer of this.layers) {
                        this.paint(layer, layer.entities);
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
                if (entity instanceof Game.Shape) {
                    switch (entity.shape.constructor) {
                        case Board.Rect:
                            let ex = entity.x + offsetX - entity.shape.width / 2
                            let ey = entity.y + offsetY - entity.shape.height / 2
                            if (
                                (ex < x && ex + entity.shape.width > x) &&
                                (ey < y && ey + entity.shape.height > y)
                            ) {
                                targetEntities.push(entity);
                                flag = true;
                            }
                            break;
                    }
                } else if (entity instanceof Game.EntityGroup) {
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

    paint(layer, entities, offsetX, offsetY, bg) {
        if (bg != null && bg != false){
            layer.fill(layer.bgColor);
        }
        if (isNaN(offsetX)) {
            offsetX = 0;
        }
        if (isNaN(offsetY)) {
            offsetY = 0;
        }
        for (let entity of entities) {
            if (entity instanceof Game.EntityGroup) {
                this.paint(layer, entity.entities, entity.x + offsetX, entity.y + offsetY, false);
            } else if (entity instanceof Game.Shape) {
                layer.drawShape(entity.x + offsetX, entity.y + offsetY, entity.shape);
            }
        }
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

Desk.EntityGroup = class EntityGroup extends Desk.Entity {
    constructor(x, y, entities) {
        super(x, y);
        this.entities = entities;
    }
}

Desk.Layer = class Layer extends Board {
    constructor(name, x, y, w, h, z) {
        super(x, y, w, h, z);
        this.name = name;
        this.entities = [];
    }
}

module.exports = Desk;