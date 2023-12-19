class InteractableCanvas {
    canvasInterface;
    canvasView;
    canvasInputHandler;
    canvasModel;

    constructor(destinationContainerID) {
        this.canvasInterface = new canvasInterface();
        document.getElementById(destinationContainerID).append(this.canvasInterface.mainContainer);
        this.canvasView = new CanvasView(this.canvasInterface);
        this.canvasInputHandler = new CanvasInputHandler(this.canvasInterface, this);
        this.canvasModel = new CanvasModel();
        
        
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
    closeButton;
    
    constructor() {
        this.mainContainer = document.createElement('div');
        this.topRow = document.createElement('div');
        this.canvas = document.createElement('canvas');
        this.toggleButton = document.createElement('button');
        this.resetButton = document.createElement('button');
        this.closeButton = document.createElement('button');
        this.setText();
        this.structureNodes();
    }

    setText(){
        this.toggleButton.innerHTML = 'Toggle';
        this.resetButton.innerHTML = 'Reset';
        this.closeButton.innerHTML = 'Close';
    }

    structureNodes() {
        this.topRow.appendChild(this.toggleButton);
        this.topRow.appendChild(this.resetButton);
        this.topRow.appendChild(this.closeButton);
        this.mainContainer.appendChild(this.topRow);
        this.mainContainer.appendChild(this.canvas);
    }

}

class CanvasView {
    points;
    canvasInterface;
    ctx;

    constructor(canvasInterface) {
        this.canvasInterface = canvasInterface;
        this.ctx = canvasInterface.canvas.getContext('2d');

        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 5;
    }

    loadPointArray(points) {
        this.points = points;
    }

    drawPoints(){
        this.ctx.clearRect(0, 0, this.canvasInterface.canvas.width, this.canvasInterface.canvas.height);
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        this.ctx.stroke();
    }
}

class CanvasInputHandler {
    parent;
    canvasInterface;
    canvasOffset;
    inputState;

    constructor(canvasInterface, parent) {
        this.parent = parent;
        this.canvasInterface = canvasInterface;
        this.canvasOffset = this.canvasInterface.canvas.getBoundingClientRect();
        this.inputState = new CanvasInputState();

        this.addMouseInputListeners();
    }

    addMouseInputListeners() {
        let currentHandler = this;

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

    getInputState() {
        return this.inputState;
    }

}

class CanvasModel {
    originalPoints = [];
    currentPoint;
    previousInputState;
    currentInputState;

    zoomLevel = 0;

    constructor() {
        this.previousInputState = new CanvasInputState();
        this.currentInputState = new CanvasInputState();
    }

    setOriginalPoints(points) {
        this.originalPoints = points;
    }

    update(incomingInputState) {
        this.previousInputState.setAllFields(this.currentInputState);
        this.currentInputState.setAllFields(incomingInputState);

        this.zoomLevel += this.currentInputState.zoomState;

        if (!this.previousInputState.mouseIsDown && this.currentInputState.mouseIsDown) {
            console.log('ADDING POINT')
            this.addPointFromMouseCoordinates();
        } else if (this.previousInputState.mouseIsDown && this.currentInputState.mouseIsDown) {
            console.log('MOVING POINT')
            this.editPointFromMouseCoordinates();
        }
    }

    addPointFromMouseCoordinates() {
        this.originalPoints.push(new Point(this.currentInputState.mouseX, this.currentInputState.mouseY));
        this.currentPoint = this.originalPoints[this.originalPoints.length - 1];
    }

    editPointFromMouseCoordinates() {
        this.currentPoint.x = this.currentInputState.mouseX;
        this.currentPoint.y = this.currentInputState.mouseY;
    }
}

class Point {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
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
d.canvasModel.setOriginalPoints([new Point(0,0), new Point(50,100)])
c.canvasModel.setOriginalPoints([new Point(0,0), new Point(50,100), new Point(150,25)])
d.init();
c.init();