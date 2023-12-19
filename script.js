class InteractableCanvas {
    canvasView;
    canvasInputHandler;
    canvasModel;

    constructor(canvasID) {
        this.canvasView = new CanvasView(canvasID);
        this.canvasInputHandler = new CanvasInputHandler(canvasID, this);
        this.canvasModel = new CanvasModel();

        
    }
    init() {
        this.canvasView.loadPointArray(this.canvasModel.originalPoints);
    }

    update() {
        this.canvasModel.update(this.canvasInputHandler.getInputState());
        this.canvasView.drawPoints();
    }
}

class CanvasView {
    points;
    canvas;
    ctx;

    constructor(canvasID) {
        this.canvas = jQuery($(canvasID).get(0));
        this.ctx = canvas.getContext('2d');

        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 5;
    }

    loadPointArray(points) {
        this.points = points;
    }

    drawPoints(){
        this.ctx.clearRect(0, 0, this.canvas.width(), this.canvas.height());
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
    canvasDOM;
    canvasOffset;
    inputState;

    constructor(canvasID, parent) {
        this.parent = parent;
        this.canvasDOM = jQuery($(canvasID).get(0));
        this.canvasOffset = this.canvasDOM.offset();
        this.inputState = new CanvasInputState();

        let currentHandler = this;

        this.canvasDOM.on('mouseenter', function () {
            currentHandler.inputState.mouseInBounds = true;
        });

        this.canvasDOM.on('mouseleave', function () {
            currentHandler.inputState.mouseInBounds = false;
            currentHandler.parent.update();
        });

        this.canvasDOM.on('mousedown', function () {
            currentHandler.inputState.mouseIsDown = true;
            currentHandler.parent.update();
        });

        this.canvasDOM.on('mouseup', function () {
            currentHandler.inputState.mouseIsDown = false;
            currentHandler.parent.update();
        });

        this.canvasDOM.on('mousemove', function (event) {
            currentHandler.inputState.mouseX = event.pageX - currentHandler.canvasOffset.left;
            currentHandler.inputState.mouseY = event.pageY - currentHandler.canvasOffset.top;
            currentHandler.parent.update();
        });

        this.canvasDOM.on('mousewheel DOMMouseScroll', function (event) {
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
        console.log(this.currentInputState.toString());

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

let c = new InteractableCanvas('#canvas');
c.canvasModel.setOriginalPoints([new Point(0,0), new Point(50,100), new Point(150,25)])
c.init();