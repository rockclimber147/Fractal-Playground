class MainCanvas {
    canvas;
    ctx;
    canvasOffset;
    mouseIsPressed = false;
    dragging = true;
    lastMouseX;
    lastMouseY;
    // pan and zoom model 1
    xPan = 0;
    yPan = 0;
    zoomCoefficient = 1;
    // Pan and zoom model 2
    virtualBounds;
    xSpan;
    ySpan;

    points = [[0, 0], [50, 100], [150, 25]];

    constructor(canvasID) {
        var that = this; // store object this as this refers to the element inside listeners

        this.canvas = jQuery($(canvasID).get(0));
        this.ctx = canvas.getContext('2d');
        this.canvasOffset = this.canvas.offset();

        // [x0, y0, xMax, yMax] To be changed when zoomed
        this.virtualBounds = [0, 0, that.canvas.width(), that.canvas.height()]
        this.xSpan = this.virtualBounds[2] - this.virtualBounds[0]; // x difference
        this.ySpan = this.virtualBounds[3] - this.virtualBounds[1]; // y difference

        console.log(this.canvasOffset.left)
        // Event handlers
        this.canvas.on('mousedown', function (event) {
            that.mouseIsPressed = true;
            if (that.dragging) {
                that.lastMouseX = event.pageX - that.canvasOffset.left;
                that.lastMouseY = event.pageY - that.canvasOffset.top;
            } else {
                that.points.push([event.pageX - that.canvasOffset.left, event.pageY - that.canvasOffset.top])
                that.draw();
            }
        });
        this.canvas.mousemove(function (event) {
            if (!that.mouseIsPressed) {
                return;
            }
            if (that.dragging) {
                // get mouse coordinates on drag
                let currentX = event.pageX - that.canvasOffset.left;
                let currentY = event.pageY - that.canvasOffset.top;
                // get difference from last set of coords
                let dX = currentX - that.lastMouseX;
                let dY = currentY - that.lastMouseY;
                that.xPan += dX;
                that.yPan += dY;
                console.log(that.xPan, that.yPan)

                // update virtual bounds
                that.virtualBounds[0] += dX;
                that.virtualBounds[1] += dY;
                that.virtualBounds[2] += dX;
                that.virtualBounds[3] += dY;
                // update last coordinates
                that.lastMouseX = currentX;
                that.lastMouseY = currentY;
            } else {
                that.points[that.points.length - 1] = [event.pageX - that.canvasOffset.left, event.pageY - that.canvasOffset.top];
            }
            that.draw();
        })
        this.canvas.on('mouseup', function () {
            that.mouseIsPressed = false;
            that.draw();
        });
        this.canvas.on('mousewheel DOMMouseScroll', function (event) {
            that.xPan += event.pageX - that.canvasOffset.left;
            that.yPan += event.pageY - that.canvasOffset.top;
            if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                console.log('scroll up');
                that.zoomCoefficient *= .95;
            }
            else {
                that.zoomCoefficient *= 20/19;
                console.log('scroll down');
            }
            that.draw();
            that.xPan -= event.pageX - that.canvasOffset.left;
            that.yPan -= event.pageY - that.canvasOffset.top;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width(), this.canvas.height());
        this.ctx.beginPath();

        this.ctx.moveTo((this.points[0][0] - this.xPan) * this.zoomCoefficient + this.xPan, 
            (this.points[0][1] - this.xPan) * this.zoomCoefficient + this.yPan);
        for (let i = 1; i < this.points.length; i++) {
            this.ctx.lineTo((this.points[i][0] + this.xPan) * this.zoomCoefficient, 
                (this.points[i][1] + this.yPan) * this.zoomCoefficient);
        }
        this.ctx.stroke();
    }

    whenMouseIsPressed(event) {
        this.mouseIsPressed = false;
        console.log(this.mouseIsPressed);
        this.appendPoint([event.pageX - canvasOffset.left, event.pageY - canvasOffset.top]);
    }

}

let mainCanvas = new MainCanvas('#canvas');
mainCanvas.draw();