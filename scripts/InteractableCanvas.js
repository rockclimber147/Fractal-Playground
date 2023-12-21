import {CanvasInputState, CanvasDisplaySettings, canvasInterface} from './CanvasUtilities.js';
import { Point, CoordinateTransformations } from './Coordinates.js';

export class InteractableCanvas {
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

    reset() {
        this.canvasModel.initializePoints(this.canvasModel.originalPoints);
        this.canvasDisplaySettings.reset();
        this.init();
        this.update();
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
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 10;
    }

    loadPointArray(points) {
        this.points = points;
    }

    drawPoints() {
        this.ctx.clearRect(0, 0, this.canvasInterface.canvas.width, this.canvasInterface.canvas.height);
        this.ctx.beginPath();
        let [transformedX, transformedY] = CoordinateTransformations.modelToCanvas(this.points[0], this.canvasDisplaySettings)
        this.ctx.moveTo(transformedX,transformedY);

        for (let i = 1; i < this.points.length; i++) {
            [transformedX, transformedY] = CoordinateTransformations.modelToCanvas(this.points[i], this.canvasDisplaySettings)
            this.ctx.lineTo(transformedX, transformedY);
        }
        this.ctx.stroke();
    }
}

class CanvasInputHandler {
    canvasInterface;
    parent;
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
            currentHandler.inputState.zoomState = event.deltaY;
            currentHandler.parent.update();
            currentHandler.inputState.zoomState = 0;
        });
    }

    addButtonListeners(currentHandler) {

        this.canvasInterface.toggleButton.addEventListener('click', function () {
            console.log('TOGGLE BUTTON CLICKED');
            currentHandler.canvasDisplaySettings.isDrawing = !currentHandler.canvasDisplaySettings.isDrawing;
            currentHandler.canvasInterface.toggleButton.innerHTML = currentHandler.canvasDisplaySettings.isDrawing ? 'Draw Mode' : 'Move Mode';
            currentHandler.parent.update();
        });
        this.canvasInterface.resetButton.addEventListener('click', function () {
            currentHandler.parent.reset();
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
        if (this.currentInputState.zoomState != 0) {
            console.log('ZOOMING CANVAS')

            let mouseCoordsBeforeZoom = CoordinateTransformations.canvasToModel(this.currentInputState, this.canvasDisplaySettings);
            this.canvasDisplaySettings.zoomLevel *= 1 - this.currentInputState.zoomState / 1000;
            let mouseCoordsAfterZoom = CoordinateTransformations.canvasToModel(this.currentInputState, this.canvasDisplaySettings);
            console.log(mouseCoordsBeforeZoom, mouseCoordsAfterZoom, [mouseCoordsBeforeZoom[0] - mouseCoordsAfterZoom[0], mouseCoordsBeforeZoom[1] - mouseCoordsAfterZoom[1]])
            this.canvasDisplaySettings.xShift += (mouseCoordsBeforeZoom[0] - mouseCoordsAfterZoom[0]);
            this.canvasDisplaySettings.yShift += (mouseCoordsBeforeZoom[1] - mouseCoordsAfterZoom[1]);

        } else if (this.previousInputState.mouseIsDown && this.currentInputState.mouseIsDown) {
            console.log('MOVING CANVAS')

            this.canvasDisplaySettings.xShift -= (this.currentInputState.mouseX - this.previousInputState.mouseX) / this.canvasDisplaySettings.zoomLevel;
            this.canvasDisplaySettings.yShift -= (this.currentInputState.mouseY - this.previousInputState.mouseY) / this.canvasDisplaySettings.zoomLevel;
        }
    }

    addPointFromMouseCoordinates() {
        let [newX, newY] = CoordinateTransformations.canvasToModel(this.currentInputState, this.canvasDisplaySettings);
        this.originalPoints.push(new Point(newX, newY));
        this.currentPoint = this.originalPoints[this.originalPoints.length - 1];
    }

    editPointFromMouseCoordinates() {
        [this.currentPoint.x, this.currentPoint.y] = CoordinateTransformations.canvasToModel(this.currentInputState, this.canvasDisplaySettings);
    }
}



let c = new InteractableCanvas('canvasTestContainer');
let d = new InteractableCanvas('canvasTestContainer');

c.canvasModel.initializePoints([new Point(0, 0), new Point(100, 0), new Point(100, 100)])
d.canvasModel.initializePoints([new Point(0, 0), new Point(100, 0), new Point(100, 100)])
d.init();
c.init();