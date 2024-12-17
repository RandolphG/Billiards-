const INCH = 12;
const WALL_DI = 5 * INCH;
const FOOT = INCH * 12;
const TABLE_W = 8 * FOOT;
const VIEW_W = WALL_DI * 2 + TABLE_W;
const TABLE_H = 3.5 * FOOT;
const BALL_DI = 2.4375 * INCH;
const BALL_RAD = BALL_DI / 2;
const RETURN_H = BALL_DI * 1.75;
const VIEW_H = WALL_DI * 2 + TABLE_H + RETURN_H;
const WALL_RAD = WALL_DI / 2;
const COLORS = {
  white: "white",
  red: "#F44336",
  black: "#212121",
  purple: "#9C27B0",
  blue: "#2196F3",
  green: "#8bc34a",
  yellow: "#FFC107",
  orange: "#FF9800",
  brown: "#795548",
  felt: "#757575",
  pocket: "#121212",
  frame: "#3E2723",
};
const PI = Math.PI;
const PI2 = PI * 2;

function rel(x) {
  return x + WALL_DI;
}

class Canvas {
  constructor({ context }) {
    this.context = context;
  }

  drawCrosshair({ x, y }) {
    this.context.fillStyle = "rgba(255, 255, 255, 0.25)";
    this.context.beginPath();
    this.context.arc(x, y, BALL_RAD, 0, PI2, false);
    this.context.fill();
  }

  drawMovingCrosshair({ x, y }) {
    let rad = BALL_RAD - 2;
    this.context.strokeStyle = COLORS.red;
    this.context.lineWidth = 4;
    this.context.translate(x, y);
    this.context.rotate(-PI * 0.25);
    // circle
    this.context.beginPath();
    this.context.arc(0, 0, rad, 0, PI2, false);
    this.context.stroke();
    // slash
    this.context.beginPath();
    this.context.moveTo(0, (BALL_RAD + 2) * -0.5);
    this.context.lineTo(0, (BALL_RAD + 2) * 0.5);
    this.context.stroke();
    // rotating back
    this.context.rotate(PI * 0.25);
    this.context.translate(-x, -y);
  }

  drawTable({ wallBodies, pocketBodies }) {
    this.drawSlate();
    this.drawWall(wallBodies);
    this.drawReturn();
    this.drawPockets(pocketBodies);
    this.drawPoints();
  }

  drawSlate() {
    let grad = this.context.createRadialGradient(
      VIEW_W * 0.5,
      (VIEW_H - RETURN_H) * 0.5,
      TABLE_H * 0.75 * 0.125,
      VIEW_W * 0.5,
      (VIEW_H - RETURN_H) * 0.5,
      TABLE_H * 0.75 * 1.5,
    );
    grad.addColorStop(0, "rgba(255,255,255,0.05)");
    grad.addColorStop(0.25, "rgba(255,255,255,0.05)");
    grad.addColorStop(1, "rgba(255,255,255,0.15)");

    this.context.fillStyle = COLORS.felt;
    this.context.fillRect(
      WALL_RAD,
      WALL_RAD,
      TABLE_W + WALL_DI,
      TABLE_H + WALL_DI,
    );
    this.context.fillStyle = grad;
    this.context.fillRect(
      WALL_RAD,
      WALL_RAD,
      TABLE_W + WALL_DI,
      TABLE_H + WALL_DI,
    );
  }

  drawReturn() {
    let gutter = (RETURN_H - BALL_DI * 1.2) * 0.5;
    this.context.fillStyle = COLORS.pocket;
    this.context.fillRect(
      gutter,
      VIEW_H - RETURN_H + gutter,
      VIEW_W - gutter * 2,
      RETURN_H - gutter * 2,
    );
  }

  drawWall(wallBodies) {
    this.context.fillStyle = COLORS.frame;
    wallBodies.forEach((body, i) => {
      this.context.beginPath();
      body.vertices.forEach(({ x, y }, j) => {
        if (j === 0) {
          this.context.moveTo(x, y);
        } else {
          this.context.lineTo(x, y);
        }
      });
      this.context.fill();

      // BUMPERS
      this.context.save();
      this.context.beginPath();
      body.vertices.forEach(({ x, y }, j) => {
        if (j === 0) {
          this.context.moveTo(x, y);
        } else {
          this.context.lineTo(x, y);
        }
      });
      this.context.clip();
      this.context.fillStyle = "#787878";
      let clipOff = WALL_DI * 0.75;
      let clipDiff = WALL_DI - clipOff;
      this.context.fillRect(
        clipOff,
        clipOff,
        TABLE_W + clipDiff * 2,
        TABLE_H + clipDiff * 2,
      );
      this.context.restore();
    });
  }

  drawPockets(pocketBodies) {
    this.context.fillStyle = COLORS.pocket;
    pocketBodies.forEach(({ position, circleRadius }) => {
      this.context.beginPath();
      this.context.arc(position.x, position.y, circleRadius, 0, PI2, false);
      this.context.fill();
    });
  }

  drawPoints() {
    let di = 10,
      rad = di * 0.5,
      inc = TABLE_W / 7,
      xc1 = rel(TABLE_W * 0.25),
      xl1 = xc1 - inc,
      xr1 = xc1 + inc,
      xc2 = xc1 + TABLE_W * 0.5,
      xl2 = xc2 - inc,
      xr2 = xc2 + inc,
      x3 = WALL_RAD * 0.75,
      x4 = rel(TABLE_W + WALL_RAD * 1.25),
      y1 = WALL_RAD * 0.75,
      y2 = rel(TABLE_H + WALL_RAD * 1.25),
      yc3 = rel(TABLE_H * 0.5),
      yt3 = yc3 - inc,
      yb3 = yc3 + inc;
    let positions = [
      [xl1, y1],
      [xc1, y1],
      [xr1, y1],
      [xl1, y2],
      [xc1, y2],
      [xr1, y2],
      [xl2, y1],
      [xc2, y1],
      [xr2, y1],
      [xl2, y2],
      [xc2, y2],
      [xr2, y2],
      [x3, yt3],
      [x3, yc3],
      [x3, yb3],
      [x4, yt3],
      [x4, yc3],
      [x4, yb3],
    ];
    this.context.fillStyle = COLORS.brown;
    positions.forEach((coords) => {
      let x = coords[0],
        y = coords[1];
      this.context.beginPath();
      this.context.moveTo(x, y - rad);
      this.context.lineTo(x + rad, y);
      this.context.lineTo(x, y + rad);
      this.context.lineTo(x - rad, y);
      this.context.fill();
    });
  }

  drawIndicator({ x, y, cueball, power, maxDistance }) {
    this.cueX = cueball.position.x;
    this.cueY = cueball.position.y;
    this.angle = Math.atan2(y - this.cueY, x - this.cueX);
    this.angleCos = Math.cos(this.angle);
    this.angleSin = Math.sin(this.angle);

    // coordinates for starting power just off the cueball
    let lineMinX = this.cueX + BALL_DI * 1.2 * this.angleCos;
    let lineMinY = this.cueY + BALL_DI * 1.2 * this.angleSin;

    // coordinates for showing power
    let lineMaxX = lineMinX + maxDistance * this.angleCos;
    let lineMaxY = lineMinY + maxDistance * this.angleSin;

    // coordinates for calculating power
    let newX = lineMinX + power * maxDistance * this.angleCos;
    let newY = lineMinY + power * maxDistance * this.angleSin;

    // setting the force relative to power
    this.forceX = ((newX - lineMinX) / maxDistance) * 0.02;
    this.forceY = ((newY - lineMinY) / maxDistance) * 0.02;

    this.context.lineCap = "round";

    // max power
    this.context.strokeStyle = "rgba(255, 255, 255, 0.1)";
    this.context.lineWidth = 4;
    this.context.beginPath();
    this.context.moveTo(lineMinX, lineMinY);
    this.context.lineTo(lineMaxX, lineMaxY);
    this.context.stroke();
    this.context.closePath();

    // power level
    this.context.strokeStyle = "rgba(255, 255, 255, 0.9)";
    this.context.lineWidth = 4;
    this.context.beginPath();
    this.context.moveTo(lineMinX, lineMinY);
    this.context.lineTo(newX, newY);
    this.context.stroke();
    this.context.closePath();
  }

  drawBalls({ balls, ballIds }) {
    let inAngle = [];
    for (let i = 0, len = ballIds.length; i < len; i++) {
      let ballId = ballIds[i];
      let ball = balls[ballId];
      this.drawBall(ball);
    }
  }

  drawBall(ball) {
    let x = ball.body.position.x,
      y = ball.body.position.y,
      rad = ball.body.circleRadius,
      di = rad * 2,
      a = ball.body.angle;

    this.context.translate(x, y);
    this.context.rotate(a);

    // offset from center
    let offsetX = ((x - WALL_DI) / TABLE_W) * 2 - 1,
      offsetY = ((y - WALL_DI) / TABLE_H) * 2 - 1;

    let grad = this.context.createRadialGradient(
      rad * offsetX,
      rad * offsetY,
      rad * 0.125,
      rad * offsetX,
      rad * offsetY,
      rad * 1.5,
    );
    if (ball.eight) {
      grad.addColorStop(0, "rgba(255,255,255,0.15)");
      grad.addColorStop(1, "rgba(255,255,255,0.05)");
    } else {
      grad.addColorStop(0, "rgba(0,0,0,0.05)");
      grad.addColorStop(1, "rgba(0,0,0,0.3)");
    }

    this.context.shadowColor = "rgba(0,0,0,0.05)";
    this.context.shadowBlur = 2;
    this.context.shadowOffsetX = -offsetX * BALL_RAD * 0.5;
    this.context.shadowOffsetY = -offsetY * BALL_RAD * 0.5;

    this.context.fillStyle = ball.color;
    this.context.beginPath();
    this.context.arc(0, 0, rad, 0, PI2, false);
    this.context.fill();
    this.context.shadowColor = "transparent";

    if (ball.stripes) {
      let s1 = PI * 0.15,
        e1 = PI - s1,
        s2 = PI * -0.15,
        e2 = PI - s2;
      this.context.fillStyle = "white";
      this.context.beginPath();
      this.context.arc(0, 0, rad, s1, e1, false);
      this.context.fill();
      this.context.beginPath();
      this.context.arc(0, 0, rad, s2, e2, true);
      this.context.fill();
    }

    this.context.rotate(-a);

    this.context.beginPath();
    this.context.arc(0, 0, rad, 0, PI2, false);
    this.context.fillStyle = grad;
    this.context.fill();

    this.context.translate(-x, -y);
  }
}

export default Canvas;
