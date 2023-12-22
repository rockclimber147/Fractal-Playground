import { InteractableCanvas, CanvasModel, CModelScaleRotate } from './InteractableCanvas.js';
import { Point, CoordinateTransformations } from './Coordinates.js';

let mainCanvas = new InteractableCanvas('canvasMainContainer');
mainCanvas.init(new CanvasModel());

let c = new InteractableCanvas('canvasMainContainer');
c.init(new CModelScaleRotate());

document.getElementById('update').addEventListener('click', update);
c.canvasInterface.canvas.addEventListener('mousedown', update);

function update(){
    let matrix = CoordinateTransformations.getRotationScaleMatrix(
        c.canvasModel.currentPoints[1],
        c.canvasModel.currentPoints[0],
        c.canvasModel.currentPoints[2],
        );
    
    let toAdd = [];
    for (let i = 0; i < mainCanvas.canvasModel.currentPoints.length; i++) {
        toAdd.push(mainCanvas.canvasModel.currentPoints[i].getMatrixTransformationResult(matrix));
    }
    let lastX = mainCanvas.canvasModel.currentPoints[mainCanvas.canvasModel.currentPoints.length - 1].x;
    let lastY = mainCanvas.canvasModel.currentPoints[mainCanvas.canvasModel.currentPoints.length - 1].y;
    
    let firstX = toAdd[0].x;
    let firstY = toAdd[0].y;

    let deltaX = lastX - firstX;
    let deltaY = lastY - firstY;

    for (let i = 0; i < toAdd.length; i++) {
        toAdd[i].x += deltaX;
        toAdd[i].y += deltaY;
    }

    mainCanvas.canvasModel.currentPoints.push(...toAdd);
    mainCanvas.update();
}