let electron = require('electron');
global.Game = require('./Game.js');
global.BrowserWindow = electron.remote.BrowserWindow;

let game = new Game();
game.start();