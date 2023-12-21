import { Point } from './Coordinates.js';
import { InteractableCanvas } from './InteractableCanvas.js';

let c = new InteractableCanvas('canvasMainContainer', [new Point(0, 0), new Point(100, 0), new Point(100, 100)]);
c.init();