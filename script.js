class InteractableCanvas {
    canvasInterface;
    canvasView;
    canvasInputHandler;
    canvasModel;
    canvasDisplaySettings;

    constructor(destinationContainerID) {
        this.canvasInterface = new canvasInterface();
        document.getElementById(destinationContainerID).append(this.canvasInterface.mainContainer);
        this.canvasDisplaySettings = new CanvasDisplaySettings();

        this.canvasView = new CanvasView(this.canvasInterface, this.canvasDisplaySettings);
        this.canvasInputHandler = new CanvasInputHandler(this.canvasInterface, this, this.canvasDisplaySettings);
        this.canvasModel = new CanvasModel(this.canvasDisplaySettings);
        


    }
    init() {
        this.canvasView.loadPointArray(this.canvasModel.originalPoints);
        this.update();
    }

    update() {
        this.canvasModel.update(this.canvasInputHandler.getInputState());
        this.canvasView.drawPoints();
    }
}

class canvasInterface {
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

class CanvasView {
    points;
    canvasInterface;
    canvasDisplaySettings;
    ctx;
    
    constructor(canvasInterface, canvasDisplaySettings) {
        this.canvasInterface = canvasInterface;
        this.canvasDisplaySettings = canvasDisplaySettings;
        this.ctx = canvasInterface.canvas.getContext('2d');

        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 5;
    }

    loadPointArray(points) {
        this.points = points;
    }

    drawPoints() {
        this.ctx.clearRect(0, 0, this.canvasInterface.canvas.width, this.canvasInterface.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(
            this.points[0].x + this.canvasDisplaySettings.xShift, 
            this.points[0].y + this.canvasDisplaySettings.yShift
            );

        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(
                this.points[i].x + this.canvasDisplaySettings.xShift,
                this.points[i].y + this.canvasDisplaySettings.yShift
                );
        }
        this.ctx.stroke();
    }
}

class CanvasInputHandler {
    parent;
    canvasInterface;
    canvasDisplaySettings;
    canvasOffset;
    inputState;

    constructor(canvasInterface, parent, canvasDisplaySettings) {
        this.parent = parent;
        this.canvasInterface = canvasInterface;
        this.canvasDisplaySettings = canvasDisplaySettings;
        this.canvasOffset = this.canvasInterface.canvas.getBoundingClientRect();
        this.inputState = new CanvasInputState();

        this.addMouseInputListeners(this);
        this.addButtonListeners(this);
    }

    addMouseInputListeners(currentHandler) {

        this.canvasInterface.canvas.addEventListener('mouseenter', function () {
            currentHandler.inputState.mouseInBounds = true;
        });

        this.canvasInterface.canvas.addEventListener('mouseleave', function () {
            currentHandler.inputState.mouseInBounds = false;
            currentHandler.parent.update();
        });

        this.canvasInterface.canvas.addEventListener('mousedown', function () {
            currentHandler.inputState.mouseIsDown = true;
            currentHandler.parent.update();
        });

        this.canvasInterface.canvas.addEventListener('mouseup', function () {
            currentHandler.inputState.mouseIsDown = false;
            currentHandler.parent.update();
        });

        this.canvasInterface.canvas.addEventListener('mousemove', function (event) {
            currentHandler.inputState.mouseX = event.pageX - currentHandler.canvasOffset.left;
            currentHandler.inputState.mouseY = event.pageY - currentHandler.canvasOffset.top;
            console.log(currentHandler.canvasOffset.left + " " + currentHandler.canvasOffset.top);
            currentHandler.parent.update();
        });

        this.canvasInterface.canvas.addEventListener('mousewheel DOMMouseScroll', function (event) {
            if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                currentHandler.inputState.zoomState = 1;
            }
            else {
                currentHandler.inputState.zoomState = -1;
            }
            currentHandler.parent.update();
            currentHandler.inputState.zoomState = 0;
        });
    }

    addButtonListeners(currentHandler) {

        this.canvasInterface.toggleButton.addEventListener('click', function () {
            console.log('TOGGLE BUTTON CLICKED');
            currentHandler.canvasDisplaySettings.isDrawing = !currentHandler.canvasDisplaySettings.isDrawing;
            currentHandler.parent.update();
        });
        this.canvasInterface.resetButton.addEventListener('click', function () {
            console.log('RESET BUTTON CLICKED');
        });
    }

    getInputState() {
        return this.inputState;
    }

}

class CanvasModel {
    originalPoints = [];
    currentPoint;
    previousInputState;
    currentInputState;
    
    canvasDisplaySettings;

    constructor(canvasDisplaySettings) {
        this.canvasDisplaySettings = canvasDisplaySettings;
        this.previousInputState = new CanvasInputState();
        this.currentInputState = new CanvasInputState();
    }

    initializePoints(points) {
        this.originalPoints = points;
    }

    update(incomingInputState) {
        this.previousInputState.setAllFields(this.currentInputState);
        this.currentInputState.setAllFields(incomingInputState);

        this.canvasDisplaySettings.zoomLevel += this.currentInputState.zoomState;
        if (this.canvasDisplaySettings.isDrawing) {
            this.updatePoints();
        } else {
            this.updatePosition();
        }
    }

    updatePoints() {
        if (!this.previousInputState.mouseIsDown && this.currentInputState.mouseIsDown) {
            console.log('ADDING POINT')
            this.addPointFromMouseCoordinates();
        } else if (this.previousInputState.mouseIsDown && this.currentInputState.mouseIsDown) {
            console.log('MOVING POINT')
            this.editPointFromMouseCoordinates();
        }
    }

    updatePosition() {
        if (this.previousInputState.mouseIsDown && this.currentInputState.mouseIsDown) {
            console.log('MOVING CANVAS')

            this.canvasDisplaySettings.xShift += this.currentInputState.mouseX - this.previousInputState.mouseX;
            this.canvasDisplaySettings.yShift += this.currentInputState.mouseY - this.previousInputState.mouseY;
        }
    }

    addPointFromMouseCoordinates() {
        this.originalPoints.push(new Point(
            this.currentInputState.mouseX - this.canvasDisplaySettings.xShift, 
            this.currentInputState.mouseY - this.canvasDisplaySettings.yShift
            ));
        this.currentPoint = this.originalPoints[this.originalPoints.length - 1];
    }

    editPointFromMouseCoordinates() {
        this.currentPoint.x = this.currentInputState.mouseX - this.canvasDisplaySettings.xShift;
        this.currentPoint.y = this.currentInputState.mouseY - this.canvasDisplaySettings.yShift;
    }
}

class CanvasDisplaySettings {
    zoomLevel = 0;
    xShift = 0;
    yShift = 0;
    isDrawing = true;
}

class Point {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Point(this.x, this.y);
    }

    copy(point){
        this.x = point.x;
        this.y = point.y;
    }

}

class CanvasInputState {
    mouseIsDown = false;
    mouseInBounds = false;
    mouseX = 0;
    mouseY = 0;
    zoomState = 0;

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

let c = new InteractableCanvas('canvasTestContainer');
let d = new InteractableCanvas('canvasTestContainer');
d.canvasModel.initializePoints([new Point(0, 0), new Point(50, 100)])
c.canvasModel.initializePoints([new Point(0, 0), new Point(50, 100), new Point(150, 25)])
d.init();
c.init();