export class Point {
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

export class CoordinateTransformations {
    static getTransformedCoordinates(point, canvasDisplaySettings) {
        let transformedX = (point.x * canvasDisplaySettings.zoomLevel) + canvasDisplaySettings.currentXShift;
        let transformedY = (point.y * canvasDisplaySettings.zoomLevel) + canvasDisplaySettings.currentYShift;
        console.log("transformedX: " + transformedX + " transformedY: " + transformedY);
        return [transformedX, transformedY];
    }

    static getBaseCoordinates(currentInputState, canvasDisplaySettings) {
        return [
            currentInputState.mouseX - canvasDisplaySettings.currentXShift,
            currentInputState.mouseY - canvasDisplaySettings.currentYShift
        ];
    }
}
