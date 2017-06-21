const EventEmitter = require('events');

global.GameStates = {
	LOADING: 0,
	MAIN_MENU: 1,
	IN_WORLD: 2
}

let Game = class Game extends Desk {
	constructor() {
		super();
		this.ups = 10;
	}

	load() {
		this.layers.push(new Desk.Layer("background", 0, 0, settings.winWidth, settings.winHeight, 0));
		this.layers.push(new Desk.Layer("GUI", 0, 0, settings.winWidth, settings.winHeight, 1));
		this.getLayer("GUI").entities.push(require('./toolbar.js'));

		this.listen();

		this.state = GameStates.MAIN_MENU;
	}

	updateLoop() {
		this.updates = true;
		setTimeout(() => {
			if (!this.stop) {
				switch (this.state) {
					case GameStates.LOADING:
						this.load();
						break;
					case GameStates.MAIN_MENU:
						break;
					case GameStates.IN_WORLD:
						this.world.emit('update');
						break;
				}
				this.updateLoop();
			}
		}, 1000 / this.ups)
	}

	start() {
		this.layers = [];
		this.state = GameStates.LOADING;
		this.world = null;
		this.stop = false;
		super.start();
		this.updateLoop();
	}
}

module.exports = Game;