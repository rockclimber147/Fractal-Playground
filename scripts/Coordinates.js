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

    getMatrixTransformationResult(matrix) {
        return new Point(
            this.x * matrix[0][0] + this.y * matrix[0][1],
            this.x * matrix[1][0] + this.y * matrix[1][1]
        );
    }

}

export class CoordinateTransformations {
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

    static getRotationScaleMatrix(origin, v1, v2) {
        let v1Prime = new Point(v1.x - origin.x, v1.y - origin.y);
        let v2Prime = new Point(v2.x - origin.x, v2.y - origin.y);

        let v1PrimeLength = Math.sqrt(v1Prime.x * v1Prime.x + v1Prime.y * v1Prime.y);
        let v2PrimeLength = Math.sqrt(v2Prime.x * v2Prime.x + v2Prime.y * v2Prime.y);

        let theta = Math.acos((v1Prime.x * v2Prime.x + v1Prime.y * v2Prime.y) / (v1PrimeLength * v2PrimeLength));
        let ratio = v1PrimeLength / v2PrimeLength;

        let scaledCosine = ratio * Math.cos(theta);
        let scaledSine = ratio * Math.sin(theta); 

        return [
            [scaledCosine, -scaledSine],
            [scaledSine, scaledCosine]
        ];
    }
}
