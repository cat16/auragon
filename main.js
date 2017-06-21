const electron = require('electron');

const { app, BrowserWindow } = electron;
const url = require('url');
const settings = require('./settings.json');

let win;

function start() {
	win = new BrowserWindow({
		width: settings.winWidth,
		height: settings.winHeight,
		frame: false,
		show: false
	})

	win.webContents.on('did-finish-load', function () {
		win.show();
	});

	let desk_modules = "";

	let files = require('fs').readdirSync("./desk_modules");
	for (let file of files) {
		if (file.endsWith(".js")) {
			desk_modules += "global." + file.slice(0, -3) + " = require(path + '/desk_modules/" + file + "');";
		}
	}

	win.loadURL('data:text/html,<html><body></body><script>' +
		"let path = require('electron').remote.app.getAppPath();" +
		"global.settings = require(path+'/settings.json');" +
		desk_modules +
		"require(path+'/"+settings.mainFile+"');" +
		'</script></html>');
	
	if(settings.devMode)
		win.webContents.openDevTools({mode:"detach"})

	win.on('closed', () => {
		win = null;
	});
}

app.on('ready', start);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (win === null) {
		start()
	}
})