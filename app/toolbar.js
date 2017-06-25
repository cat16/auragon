const Desk = require('Desk.js');
const Board = Desk.Board;
const BrowserWindow = require('electron').remote.BrowserWindow;

module.exports = desk => {

    let winWidth = BrowserWindow.getFocusedWindow().getBounds().width;
    let winHeight = BrowserWindow.getFocusedWindow().getBounds().height;

    let toolbar = [];

    let bar = new Desk.Shape(0, 0, new Board.Rect(winWidth, desk.toolbarHeight), { color: "#666666" });
    desk.setDraggableRegion(0, 0, bar.shape.width - desk.toolbarButtonWidth * 3, desk.toolbarHeight);
    toolbar.push(bar);

    let exitSquare = new Desk.Button(0, 0, new Board.Rect(desk.toolbarButtonWidth, desk.toolbarHeight), {}, "transparent", "#aa0000", "#ff5555", () => {
        this.stop = true;
        BrowserWindow.getFocusedWindow().close();
    });
    let middleX = exitSquare.shape.width / 2;
    let middleY = exitSquare.shape.height / 2;
    let exitButton = new Desk.EntityGroup(winWidth - desk.toolbarButtonWidth, 0, [
        exitSquare,
        new Desk.Shape(middleX - 5, middleY - 5, new Board.Line(10, 10), { color: "#ffffff" }),
        new Desk.Shape(middleX + 5, middleY - 5, new Board.Line(-10, 10), { color: "#ffffff" })
    ]);
    toolbar.push(exitButton);

    let maximizeSquare = new Desk.Button(0, 0, new Board.Rect(desk.toolbarButtonWidth, desk.toolbarHeight), {}, "transparent", "#005500", "#55ff55", () => {
        let window = BrowserWindow.getFocusedWindow();
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    });
    middleX = exitSquare.shape.width / 2;
    middleY = exitSquare.shape.height / 2;
    let maximizeButton = new Desk.EntityGroup(winWidth - desk.toolbarButtonWidth * 2, 0, [
        maximizeSquare,
        new Desk.Shape(middleX - 5, middleY - 5, new Board.Rect(10, 10), { outline: { color: "#ffffff" } }),
    ]);
    toolbar.push(maximizeButton);

    let minimizeSquare = new Desk.Button(0, 0, new Board.Rect(desk.toolbarButtonWidth, desk.toolbarHeight), {}, "transparent", "#0033aa", "#5555ff", () => {
        let window = BrowserWindow.getFocusedWindow();
        window.minimize();
    });
    middleX = exitSquare.shape.width / 2;
    middleY = exitSquare.shape.height / 2;
    let minimizeButton = new Desk.EntityGroup(winWidth - desk.toolbarButtonWidth * 3, 0, [
        minimizeSquare,
        new Desk.Shape(middleX - 5, middleY + 5, new Board.Line(10, 0), { color: "#ffffff" }),
    ]);
    toolbar.push(minimizeButton);

    let name = new Desk.Shape(10, 15, new Board.Text("test", "15px Arial"), { color: "#ffffff" });
    toolbar.push(name);

    return new Desk.EntityGroup(0, 0, toolbar);
}