import { Point } from './Coordinates.js';
import { InteractableCanvas } from './InteractableCanvas.js';

let c = new InteractableCanvas('canvasTestContainer', [new Point(0, 0), new Point(100, 0), new Point(100, 100)]);
let d = new InteractableCanvas('canvasTestContainer', [new Point(0, 0), new Point(100, 0), new Point(100, 100)]);

d.init();
c.init();