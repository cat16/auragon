const EventEmitter = require('events');
const Desk = require('Desk');
const BrowserWindow = require('electron').remote.BrowserWindow;

global.GameStates = {
	LOADING: 0,
	MAIN_MENU: 1,
	IN_WORLD: 2
}

let Game = class Game extends Desk {
	constructor() {
		super();
		this.ups = 60;
		this.toolbarHeight = 20;
		this.toolbarButtonWidth = 30;
	}

	load() {
		this.bgColor = "#000000";

		let winWidth = BrowserWindow.getFocusedWindow().getBounds().width;
		let winHeight = BrowserWindow.getFocusedWindow().getBounds().height;

		this.layers.push(new Desk.Layer("background", 0, 0, winWidth, winHeight, 0));
		this.layers.push(new Desk.Layer("toolbar", 0, 0, winWidth, winHeight, 1));
		this.getLayer("background").bgColor = "#444444";
		this.getLayer("toolbar").entities.push(require('./toolbar.js')(this));

		this.listen();
		this.autoResize();

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