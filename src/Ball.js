const INCH = 12;
const FOOT = INCH * 12;
const BALL_DI = 2.4375 * INCH;
const TABLE_H = 3.5 * FOOT;
const TABLE_W = 8 * FOOT;
const WALL_DI = 5 * INCH;
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
const Bodies = Matter.Bodies;
const Body = Matter.Body;

function rel(x) {
  return x + WALL_DI;
}

export default class Ball {
  constructor({ number, cueball }) {
    this.cue = number === 0;
    this.eight = number === 8;
    this.stripes = number > 8;
    this.solids = number > 0 && number < 8;
    this.number = number;
    this.diameter = BALL_DI;
    this.pocketed = false;
    this.setInitialCoordinates();
    this.setRender();
    this.setColor();
    this.cueball = cueball;
    this.build();
  }

  get fromCueball() {
    return {
      angle: Vector.angle(this.body.position, this.cueball.body.position),
    };
  }

  setInitialCoordinates() {
    let pos = Ball.positions[this.number].map((p) => rel(p));
    this.x = pos[0];
    this.y = pos[1];
  }

  setColor() {
    this.color =
      COLORS[
        [
          "white",
          "yellow",
          "blue",
          "red",
          "purple",
          "orange",
          "green",
          "brown",
          "black",
          "yellow",
          "blue",
          "red",
          "purple",
          "orange",
          "green",
          "brown",
        ][this.number]
      ];
  }

  setRender() {
    this.render = { fillStyle: "transparent", lineWidth: 0 };
  }

  enable() {
    Body.setStatic(this.body, false);
    this.pocketed = false;
    this.body.isSensor = false;
  }

  disable() {
    if (!this.cue) Body.setStatic(this.body, true);
    this.pocketed = true;
    this.body.isSensor = true;
  }

  rest() {
    this.setVelocity({ x: 0, y: 0 });
    Body.setPosition(this.body, this.body.position);
    Body.update(this.body, 0, 0, 0);
  }

  reset() {
    this.enable();
    this.setVelocity({ x: 0, y: 0 });
    Body.setPosition(this.body, { x: this.x, y: this.y });
  }

  pocket({ x, y }) {
    this.disable();
    Body.setVelocity(this.body, { x: 0, y: 0 });
    Body.setAngle(this.body, 0);
    Body.setPosition(this.body, { x, y });
    Body.update(this.body, 0, 0, 0);
  }

  setVelocity({ x, y }) {
    Body.setVelocity(this.body, { x, y });
  }

  build() {
    this.body = Bodies.circle(this.x, this.y, this.diameter / 2, {
      render: this.render,
      label: "ball",
      restitution: 0.9,
      friction: 0.001,
      density: this.cue ? 0.00021 : 0.0002,
    });
  }

  static get positions() {
    let radians60 = 60 * (Math.PI / 180),
      radians60Sin = Math.sin(radians60),
      radians60Cos = Math.cos(radians60);

    let postStartX = TABLE_W - TABLE_W / 4,
      postStartY = TABLE_H / 2,
      pos1 = [postStartX, postStartY],
      pos2 = [
        postStartX + radians60Sin * BALL_DI,
        postStartY - radians60Cos * BALL_DI,
      ],
      pos3 = [
        postStartX + radians60Sin * (BALL_DI * 2),
        postStartY - radians60Cos * (BALL_DI * 2),
      ],
      pos4 = [
        postStartX + radians60Sin * (BALL_DI * 3),
        postStartY - radians60Cos * (BALL_DI * 3),
      ],
      pos5 = [
        postStartX + radians60Sin * (BALL_DI * 4),
        postStartY - radians60Cos * (BALL_DI * 4),
      ];
    return [
      [
        // cue
        TABLE_W / 4,
        TABLE_H / 2,
      ],
      pos1, // 1
      pos2, // 2
      pos3, // 3
      pos4, // 4
      [
        // 5
        pos1[0] + radians60Sin * (BALL_DI * 4),
        pos1[1] + radians60Cos * (BALL_DI * 4),
      ],
      [
        // 6
        pos4[0] + radians60Sin * BALL_DI,
        pos4[1] + radians60Cos * BALL_DI,
      ],
      [
        // 7
        pos2[0] + radians60Sin * BALL_DI * 2,
        pos2[1] + radians60Cos * BALL_DI * 2,
      ],
      [
        // 8
        pos2[0] + radians60Sin * BALL_DI,
        pos2[1] + radians60Cos * BALL_DI,
      ],
      [
        // 9
        pos1[0] + radians60Sin * BALL_DI,
        pos1[1] + radians60Cos * BALL_DI,
      ],
      [
        // 10
        pos1[0] + radians60Sin * (BALL_DI * 2),
        pos1[1] + radians60Cos * (BALL_DI * 2),
      ],
      [
        // 11
        pos1[0] + radians60Sin * (BALL_DI * 3),
        pos1[1] + radians60Cos * (BALL_DI * 3),
      ],
      pos5, // 12
      [
        // 13
        pos2[0] + radians60Sin * (BALL_DI * 3),
        pos2[1] + radians60Cos * (BALL_DI * 3),
      ],
      [
        // 14
        pos3[0] + radians60Sin * BALL_DI,
        pos3[1] + radians60Cos * BALL_DI,
      ],
      [
        // 15
        pos3[0] + radians60Sin * (BALL_DI * 2),
        pos3[1] + radians60Cos * (BALL_DI * 2),
      ],
    ];
  }
}
