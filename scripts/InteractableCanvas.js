import {CanvasInputState, CanvasDisplaySettings, canvasInterface} from './CanvasUtilities.js';
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
        let [transformedX, transformedY] = CoordinateTransformations.getTransformedCoordinates(this.points[0], this.canvasDisplaySettings)
        this.ctx.moveTo(transformedX,transformedY);

        for (let i = 1; i < this.points.length; i++) {
            [transformedX, transformedY] = CoordinateTransformations.getTransformedCoordinates(this.points[i], this.canvasDisplaySettings)
            this.ctx.lineTo(transformedX, transformedY);
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
            currentHandler.parent.update();
        });

        this.canvasInterface.canvas.addEventListener('wheel', function (event) {
            if (event.deltaY > 0) {
                currentHandler.canvasDisplaySettings.zoomLevel *= 2;
            }
            else {
                currentHandler.canvasDisplaySettings.zoomLevel /= 2;
            }
            currentHandler.inputState.justZoomed = true;
            currentHandler.parent.update();
            currentHandler.inputState.justZoomed = false;
            console.log(currentHandler.canvasDisplaySettings);
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

            this.canvasDisplaySettings.cumulativeXShift += this.currentInputState.mouseX - this.previousInputState.mouseX;
            this.canvasDisplaySettings.cumulativeYShift += this.currentInputState.mouseY - this.previousInputState.mouseY;
        }
    }

    addPointFromMouseCoordinates() {
        let [newX, newY] = this.getBaseCoordinates();
        this.originalPoints.push(new Point(newX, newY));
        this.currentPoint = this.originalPoints[this.originalPoints.length - 1];
    }

    editPointFromMouseCoordinates() {
        [this.currentPoint.x, this.currentPoint.y] = CoordinateTransformations.getBaseCoordinates(this.currentInputState, this.canvasDisplaySettings);
    }
}

class CoordinateTransformations {
    static getTransformedCoordinates(point, canvasDisplaySettings) {
        let transformedX = (point.x * canvasDisplaySettings.zoomLevel) + canvasDisplaySettings.currentXShift;
        let transformedY = (point.y * canvasDisplaySettings.zoomLevel) + canvasDisplaySettings.currentYShift;
        return [transformedX, transformedY];
    }

    static getBaseCoordinates(currentInputState, canvasDisplaySettings) {
        return [
            currentInputState.mouseX - canvasDisplaySettings.xShift,
            currentInputState.mouseY - canvasDisplaySettings.yShift
        ];
    }
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



let c = new InteractableCanvas('canvasTestContainer');
let d = new InteractableCanvas('canvasTestContainer');
d.canvasModel.initializePoints([new Point(0, 0), new Point(50, 100)])
c.canvasModel.initializePoints([new Point(0, 0), new Point(50, 100), new Point(150, 25)])
d.init();
c.init();