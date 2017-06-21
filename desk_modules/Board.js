let Board = class Board {
	constructor(x, y, w, h, z) {
		//canvas
		this.canvas = document.createElement("canvas");
		let canvas = this.canvas;
		canvas.width = w;
		canvas.height = h;
		//canvas style
		let style = canvas.style;
		style.position = "fixed";
		style.left = x;
		style.top = y;
		style["z-index"] = z;
		//canvas context
		this.ctx = canvas.getContext("2d");
		//add canvas to doc body so you can actually see things
		document.body.appendChild(canvas);
	}
	//drawing methods
	handleShape(shape, drawFunc) {
		let ctx = this.ctx;
		ctx.beginPath();
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 1;
		if (shape.rotation != null) {
			ctx.save();
			ctx.translate(shape.x, shape.y);
			ctx.rotate(2 * Math.PI * shape.rotation);
			ctx.translate(-shape.x, -shape.y);
			drawFunc();
			ctx.restore();
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
	}

	drawRect(rect) {
		let ctx = this.ctx;
		this.handleShape(rect, () => {
			ctx.rect(rect.x - rect.width / 2, rect.y - rect.height / 2, rect.width, rect.height);
		});
	}

	drawCircle(circle) {
		let ctx = this.ctx;
		this.handleShape(circle, () => {
			ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
		});
	}

	drawLine(line) {
		let ctx = this.ctx;
		this.handleShape({ x: line.x, y: line.y, outline: { color: line.color, width: line.width }, rotation: line.rotation }, () => {
			ctx.moveTo(line.x, line.y);
			ctx.lineTo(line.x+line.x2, line.y+line.y2);
		});
	}

	drawPolygon(polygon) {
		let ctx = this.ctx;
		this.handleShape(polygon, () => {
			let x = polygon.x + polygon.radius;
			let y = polygon.y;
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

	fill(color) {
		let ctx = this.ctx;
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawShape(x, y, shape) {
		shape.x = x;
		shape.y = y;
		this["draw" + shape.constructor.name](shape);
	}
}

Board.Rect = class Rect {
	constructor(width, height) {
		this.width = width;
		this.height = height;
	}
}

Board.Circle = class Circle {
	constructor(radius) {
		this.radius = radius;
	}
}

Board.Line = class Line {
	constructor(x2, y2) {
		this.x2 = x2;
		this.y2 = y2;
	}
}

Board.Polygon = class Polygon {
	constructor(sides, radius) {
		this.sides = sides;
		this.radius = radius;
	}
}

Board.Text = class Text {
	constructor() {

	}
}

module.exports = Board;