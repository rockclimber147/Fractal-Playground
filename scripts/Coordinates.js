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
    // static modelToCanvas(point, canvasDisplaySettings) {
    //     return [
    //         (point.x / canvasDisplaySettings.zoomLevel) + canvasDisplaySettings.xShift,
    //         (point.y / canvasDisplaySettings.zoomLevel) + canvasDisplaySettings.yShift
    //     ]
    // }

    // static canvasToModel(currentInputState, canvasDisplaySettings) {
    //     return [
    //         (currentInputState.mouseX - canvasDisplaySettings.xShift) * canvasDisplaySettings.zoomLevel,
    //         (currentInputState.mouseY - canvasDisplaySettings.yShift) * canvasDisplaySettings.zoomLevel
    //     ];
    // }

    static modelToCanvas(point, canvasDisplaySettings) {
        
        return [
            (point.x - canvasDisplaySettings.xShift) * canvasDisplaySettings.zoomLevel,
            (point.y - canvasDisplaySettings.yShift) * canvasDisplaySettings.zoomLevel
        ];
    }

    static canvasToModel(currentInputState, canvasDisplaySettings) {
        return [
            (currentInputState.mouseX / canvasDisplaySettings.zoomLevel) + canvasDisplaySettings.xShift,
            (currentInputState.mouseY / canvasDisplaySettings.zoomLevel) + canvasDisplaySettings.yShift
        ]
    }
}
