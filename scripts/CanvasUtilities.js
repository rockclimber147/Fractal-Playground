export class CanvasInputState {
    mouseIsDown = false;
    mouseInBounds = false;
    mouseX = 0;
    mouseY = 0;
    zoomState = 0;;

    setAllFields(canvasInputState) {
        this.mouseIsDown = canvasInputState.mouseIsDown;
        this.mouseInBounds = canvasInputState.mouseInBounds;
        this.mouseX = canvasInputState.mouseX;
        this.mouseY = canvasInputState.mouseY;
        this.zoomState = canvasInputState.zoomState;
    }

    toString() {
        return "mouseIsDown: " + this.mouseIsDown + " mouseX: " + this.mouseX + " mouseY: " + this.mouseY + " zoomState: " + this.zoomState + " mouseInBounds: " + this.mouseInBounds;
    }
}

export class CanvasDisplaySettings {
    zoomLevel = 1;
    xShift = 0;
    yShift = 0;
    isDrawing = true;
}

export class canvasInterface {
    mainContainer;
    topRow;
    canvas;
    toggleButton;
    resetButton;


    constructor() {
        this.mainContainer = document.createElement('div');
        this.topRow = document.createElement('div');
        this.canvas = document.createElement('canvas');
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.toggleButton = document.createElement('button');
        this.resetButton = document.createElement('button');
        this.setText();
        this.structureNodes();
    }

    setText() {
        this.toggleButton.innerHTML = 'Toggle';
        this.resetButton.innerHTML = 'Reset';
    }

    structureNodes() {
        this.topRow.appendChild(this.toggleButton);
        this.topRow.appendChild(this.resetButton);
        this.mainContainer.appendChild(this.topRow);
        this.mainContainer.appendChild(this.canvas);
    }

}