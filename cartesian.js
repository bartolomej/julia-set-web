function Cartesian ({
                      parentId, origin, max, interval, drawLines,
                      drawNumbers = false, drawAbscissa = true, drawOrdinate = true, showMouseCoords = true
}) {
  const MOUSE_STATES = { UP: 0, DOWN: 1 };
  const MOUSE_STATES_STRING = ['UP', 'DOWN'];


  this.elementId = parentId;
  this.canvas = null;
  this.element = document.getElementById(parentId);
  this.size = getElementSize(this.element);
  this.origin = origin
    ? origin
    : { x: this.size.width / 2, y: this.size.height / 2 };
  this.mouseState = 0;
  this.absoluteMousePos = {};
  this.relativeMousePos = {};

  if (typeof max === 'number') {
    let k = this.size.width / this.size.height;
    this.max = { y: max, x: max * k };
  } else if (max === 'object') {
    this.max = max;
  }
  this.interval = interval;

  this.drawLines = drawLines;
  this.drawNumbers = drawNumbers;
  this.drawAbscissa = drawAbscissa;
  this.drawOrdinate = drawOrdinate;
  this.showMouseCoords = showMouseCoords;


  /**
   * Get current mouse state;
   * @returns {string}['UP'|'DOWN']
   */
  this.getMouseState = function () {
    return MOUSE_STATES_STRING[this.mouseState]
  };

  this.registerListeners = function () {
    document.getElementById(parentId).addEventListener('mousedown', e => {
      this.mouseState = MOUSE_STATES.DOWN;
    });
    document.getElementById(parentId).addEventListener('mouseup', e => {
      this.mouseState = MOUSE_STATES.UP;
    });
    document.getElementById(parentId).onmousemove = e => {
      this.absoluteMousePos = { x: e.x, y: e.y };
      this.relativeMousePos = this.toRelativeCoords(
        this.absoluteMousePos.x,
        this.absoluteMousePos.y
      );
      if (this.showMouseCoords) {
        this.drawMouseCoords();
      }
    };
  };

  this.drawCoordinates = function (s) {
    const boldLineWeight = 2;
    const boldLineStroke = 100;
    s.stroke(220);
    s.textSize(10);
    s.fill(0);
    for (let x = this.origin.x; x < this.size.width; x += this.interval) {
      let oppositeStep = this.origin.x - (x - this.origin.x);
      if (this.drawLines) {
        s.line(oppositeStep, 0, oppositeStep, this.size.height);
        s.line(x, 0, x, this.size.height);
      }
      if (this.drawNumbers) {
        s.text(this.toRelativeCoords(oppositeStep).x, oppositeStep + 15, this.origin.y + 15);
        s.text(this.toRelativeCoords(x).x, x + 15, this.origin.y + 15);
      }
      if (x === this.origin.x) {
        s.stroke(boldLineStroke);
        s.strokeWeight(boldLineWeight);
        s.line(x, 0, x, this.size.height);
        s.strokeWeight(1);
        s.stroke(220);
      }
    }
    for (let y = this.origin.y; y < this.size.height; y += this.interval) {
      let oppositeStep = this.origin.y - (y - this.origin.y);
      if (this.drawLines) {
        s.line(0, oppositeStep, this.size.width, oppositeStep);
        s.line(0, y, this.size.width, y);
      }
      if (this.drawNumbers) {
        s.text(this.toRelativeCoords(0, y).y, this.origin.x + 10, y - 10);
        s.text(this.toRelativeCoords(0, oppositeStep).y, this.origin.x + 10, oppositeStep - 10);
      }
      if (y === this.origin.y) {
        s.stroke(boldLineStroke);
        s.strokeWeight(boldLineWeight);
        s.line(0, y, this.size.width, y);
        s.strokeWeight(1);
        s.stroke(220);
      }
    }
    s.stroke(0);
  };

  this.drawMouseCoords = function () {
    let textBox = document.getElementById('textBox');
    if (textBox !== null) this.element.removeChild(textBox);
    let rel = this.relativeMousePos;
    let x = this.absoluteMousePos.x + 20 + 'px';
    let y = this.absoluteMousePos.y + 20 + 'px';
    let box = document.createElement('span');
    let text = document.createTextNode(`(${rel.x}, ${rel.y})`);
    box.setAttribute("id", "textBox");
    box.appendChild(text);
    box.style.position = 'fixed';
    box.style.top = y;
    box.style.left = x;
    this.element.appendChild(box);
  };

}

Cartesian.prototype.toAbsoluteCoords = function (relX, relY) {
  return {
    x: relX / this.max.x * this.size.width / 2,
    y: -(relY / this.max.y * this.size.height / 2)
  }
};

Cartesian.prototype.toRelativeCoords = function (absX, absY) {
  return {
    x: Math.round(((absX - this.size.width / 2) * (this.max.x / (this.size.width / 2))) * 1000) / 1000,
    y: -Math.round(((absY - this.size.height / 2) * (this.max.y / (this.size.height / 2))) * 1000) / 1000
  }
};

Cartesian.prototype.init = function (p5, onDraw) {
  this.registerListeners();
  this.p5 = new p5(s => {
    s.setup = () => {
      this.canvas = s.createCanvas(this.size.width, this.size.height);
      this.canvas.parent(this.elementId);
    };
    s.windowResized = () => {
      this.size = getElementSize(this.element);
      s.resizeCanvas(this.size.width, this.size.height);
    };
    s.draw = () => {
      s.background(255);
      this.drawCoordinates(s);
      s.translate(this.origin.x, this.origin.y);
      if (!onDraw) {
        throw new Error("Draw callback not provided");
      }
      onDraw(s);
    };
  });
};

function getElementSize(ele) {
  return {
    width: ele.clientWidth,
    height: ele.clientHeight
  }
}