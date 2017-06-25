const electron = require('electron');

const { app, BrowserWindow } = electron;
const url = require('url');
const settings = require('./settings.json');

let win;

function start() {
	win = new BrowserWindow({
		width: settings.winWidth,
		height: settings.winHeight,
		frame: settings.winFrame,
		show: false
	})

	win.webContents.on('did-finish-load', function () {
		win.show();
	});

	win.loadURL('data:text/html,<html><body style = "-webkit-user-select: none;"></body><script>' +
		"let path = require('electron').remote.app.getAppPath();" +
		`require(path+'/${settings.mainFile}');` +
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