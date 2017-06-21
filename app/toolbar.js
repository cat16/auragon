let toolBar = [];

let bar = new Desk.Shape(0, 0, new Board.Rect(settings.winWidth * 2, 20 * 2), { color: "#666666" });
bar.on('mouse', (action, event) => {
    if (event.button == 0) {
        switch (action) {
            case "down":
                bar.mouseX = event.screenX-event.pageX;
                bar.mouseY = event.screenY-event.pageY;
                bar.movable = true;
                break;
            case "on":
                if(bar.movable){
                    bar.mouseX = event.screenX-event.pageX;
                    bar.mouseY = event.screenY-event.pageY;
                    window.moveTo(bar.mouseX, bar.mouseY);
                }
                break;
            case "up":
                bar.movable = false;
                break;
        }
    }
});
toolBar.push(bar);

let exitSquare = new Desk.Shape(0, 0, new Board.Rect(30, 20), { color: "#880000" });
exitSquare.on('mouse', (action, event) => {
    if (event.button == 0) {
        switch (action) {
            case "on":
                exitSquare.shape.color = "#ff0000";
                break;
            case "up":
                exitSquare.shape.color = "#ff0000";
                this.stop = true;
                var window = BrowserWindow.getFocusedWindow();
                window.close();
                break;
            case "down":
                exitSquare.shape.color = "#ff5555";
                break;
            case "off":
                exitSquare.shape.color = "#880000";
                break;
        }
    }
});
let exitButton = new Desk.EntityGroup(settings.winWidth - 15, 10, [
    exitSquare,
    new Desk.Shape(-5, -5, new Board.Line(10, 10), { color: "#ffffff" }),
    new Desk.Shape(5, -5, new Board.Line(-10, 10), { color: "#ffffff" })
]);
toolBar.push(exitButton);

module.exports = new Desk.EntityGroup(0, 0, toolBar);