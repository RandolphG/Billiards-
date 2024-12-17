const INCH = 12;
const FOOT = INCH * 12;
const TABLE_W = 8 * FOOT;
const TABLE_H = 3.5 * FOOT;
const BALL_DI = 2.4375 * INCH;
const RETURN_H = BALL_DI * 1.75;
const WALL_DI = 5 * INCH;
const VIEW_W = WALL_DI * 2 + TABLE_W;
const VIEW_H = WALL_DI * 2 + TABLE_H + RETURN_H;
const Bodies = Matter.Bodies;
const POCKET_DI = 4.5 * INCH;
const POCKET_RAD = POCKET_DI / 2;
const WALL_RAD = WALL_DI / 2;

function rel(x) {
  return x + WALL_DI;
}

export default class Table {
  constructor() {
    this.width = TABLE_W;
    this.height = TABLE_H;
    this.hypot = Math.hypot(TABLE_W, TABLE_H);
    this.build();
  }

  build() {
    this.buildBounds();
    this.buildWall();
    this.buildPockets();
  }

  buildBounds() {
    let boundsOptions = {
      isStatic: true,
      render: { fillStyle: "red" },
      label: "bounds",
      friction: 1,
      restitution: 0,
      density: 1,
    };
    let hw = VIEW_W + VIEW_H * 2;
    let vw = VIEW_H;
    let h = VIEW_H;

    this.bounds = [
      // Top
      Bodies.rectangle(VIEW_W * 0.5, h * -0.5, hw, h, boundsOptions),
      // Bottom
      Bodies.rectangle(VIEW_W * 0.5, VIEW_H + h * 0.5, hw, h, boundsOptions),
      // Left
      Bodies.rectangle(vw * -0.5, VIEW_H * 0.5, vw, h, boundsOptions),
      // Left
      Bodies.rectangle(VIEW_W + vw * 0.5, VIEW_H * 0.5, vw, h, boundsOptions),
    ];
  }

  buildWall() {
    let wallOptions = {
      isStatic: true,
      render: { fillStyle: "transparent" },
      label: "wall",
      friction: 0.0025,
      restitution: 0.6,
      density: 0.125,
      slop: 0.5,
    };

    let quarterW = (TABLE_W - POCKET_RAD * 2) / 4;
    let halfH = (TABLE_H - POCKET_RAD) / 2;
    let vertices = Table.wallVertices;
    let horizontalBlock = {
      width: WALL_DI * 1.5,
      height: WALL_DI - POCKET_RAD,
    };
    let verticalBlock = { width: WALL_DI - POCKET_RAD, height: WALL_DI * 1.5 };
    let middleBlock = {
      width: WALL_DI - POCKET_RAD,
      height: WALL_DI - POCKET_RAD,
    };
    let horTY = horizontalBlock.height / 2,
      horBY = rel(TABLE_H + WALL_DI - horizontalBlock.height / 2),
      horLX = horizontalBlock.width / 2,
      horRX = rel(TABLE_W + WALL_DI - horizontalBlock.width / 2),
      verTY = verticalBlock.height / 2,
      verBY = rel(TABLE_H + WALL_DI - verticalBlock.height / 2),
      verLX = verticalBlock.width / 2,
      verRX = rel(TABLE_W + WALL_DI - verticalBlock.width / 2);
    this.walls = [
      // Bottom Left
      Bodies.fromVertices(
        rel(TABLE_W / 4),
        rel(TABLE_H + WALL_RAD),
        vertices.bottom,
        wallOptions,
      ),
      // Bottom Right
      Bodies.fromVertices(
        rel(TABLE_W / 4 + TABLE_W / 2),
        rel(TABLE_H + WALL_RAD),
        vertices.bottom,
        wallOptions,
      ),
      // Top Left
      Bodies.fromVertices(
        rel(TABLE_W / 4),
        rel(0 - WALL_RAD),
        vertices.top,
        wallOptions,
      ),
      // Top Right
      Bodies.fromVertices(
        rel(TABLE_W / 4 + TABLE_W / 2),
        rel(0 - WALL_RAD),
        vertices.top,
        wallOptions,
      ),
      // Left
      Bodies.fromVertices(
        rel(0 - WALL_RAD),
        rel(TABLE_H / 2),
        vertices.left,
        wallOptions,
      ),
      // Right
      Bodies.fromVertices(
        rel(TABLE_W + WALL_RAD),
        rel(TABLE_H / 2),
        vertices.right,
        wallOptions,
      ),
      // TL horizontal
      Bodies.rectangle(
        horLX,
        horTY,
        horizontalBlock.width,
        horizontalBlock.height,
        wallOptions,
      ),
      // TR horizontal
      Bodies.rectangle(
        horRX,
        horTY,
        horizontalBlock.width,
        horizontalBlock.height,
        wallOptions,
      ),
      // BL horizontal
      Bodies.rectangle(
        horLX,
        horBY,
        horizontalBlock.width,
        horizontalBlock.height,
        wallOptions,
      ),
      // BR horizontal
      Bodies.rectangle(
        horRX,
        horBY,
        horizontalBlock.width,
        horizontalBlock.height,
        wallOptions,
      ),
      // TL vertical
      Bodies.rectangle(
        verLX,
        verTY,
        verticalBlock.width,
        verticalBlock.height,
        wallOptions,
      ),
      // TR vertical
      Bodies.rectangle(
        verRX,
        verTY,
        verticalBlock.width,
        verticalBlock.height,
        wallOptions,
      ),
      // BL vertical
      Bodies.rectangle(
        verLX,
        verBY,
        verticalBlock.width,
        verticalBlock.height,
        wallOptions,
      ),
      // BR vertical
      Bodies.rectangle(
        verRX,
        verBY,
        verticalBlock.width,
        verticalBlock.height,
        wallOptions,
      ),
      // B middle
      Bodies.rectangle(
        rel(TABLE_W / 2),
        horBY,
        middleBlock.width,
        middleBlock.height,
        wallOptions,
      ),
      // T middle
      Bodies.rectangle(
        rel(TABLE_W / 2),
        horTY,
        middleBlock.width,
        middleBlock.height,
        wallOptions,
      ),
    ];
  }

  buildPockets() {
    let pocketOptions = {
      render: { fillStyle: "transparent", lineWidth: 0 },
      label: "pocket",
      isSensor: true,
    };
    let pocketTopY = WALL_DI * 0.75;
    let pocketBottomY = TABLE_H + WALL_DI * 1.25;
    let pocketLeftX = WALL_DI * 0.75;
    let pocketRightX = TABLE_W + WALL_DI * 1.25;
    this.pockets = [
      Bodies.circle(pocketLeftX, pocketTopY, POCKET_RAD, pocketOptions),
      Bodies.circle(
        TABLE_W / 2 + WALL_DI,
        pocketTopY,
        POCKET_RAD,
        pocketOptions,
      ),
      Bodies.circle(pocketRightX, pocketTopY, POCKET_RAD, pocketOptions),
      Bodies.circle(pocketLeftX, pocketBottomY, POCKET_RAD, pocketOptions),
      Bodies.circle(
        TABLE_W / 2 + WALL_DI,
        pocketBottomY,
        POCKET_RAD,
        pocketOptions,
      ),
      Bodies.circle(pocketRightX, pocketBottomY, POCKET_RAD, pocketOptions),
    ];
  }

  static get wallVertices() {
    let obj = {};
    let quarterW = (TABLE_W - POCKET_RAD * 2) / 4;
    let halfH = (TABLE_H - POCKET_RAD) / 2;
    obj.bottom = [
      { x: -quarterW, y: WALL_DI },
      { x: quarterW, y: WALL_DI },
      { x: quarterW, y: POCKET_RAD },
      { x: quarterW - POCKET_RAD, y: 0 },
      { x: -quarterW + POCKET_RAD, y: 0 },
      { x: -quarterW, y: POCKET_RAD },
    ];
    obj.top = [
      { x: -quarterW, y: 0 },
      { x: quarterW, y: 0 },
      { x: quarterW, y: WALL_DI - POCKET_RAD },
      { x: quarterW - POCKET_RAD, y: WALL_DI },
      { x: -quarterW + POCKET_RAD, y: WALL_DI },
      { x: -quarterW, y: WALL_DI - POCKET_RAD },
    ];
    obj.left = [
      { y: -halfH, x: 0 },
      { y: halfH, x: 0 },
      { y: halfH, x: WALL_DI - POCKET_RAD },
      { y: halfH - POCKET_RAD, x: WALL_DI },
      { y: -halfH + POCKET_RAD, x: WALL_DI },
      { y: -halfH, x: WALL_DI - POCKET_RAD },
    ];
    obj.right = [
      { y: -halfH, x: WALL_DI },
      { y: halfH, x: WALL_DI },
      { y: halfH, x: POCKET_RAD },
      { y: halfH - POCKET_RAD, x: 0 },
      { y: -halfH + POCKET_RAD, x: 0 },
      { y: -halfH, x: POCKET_RAD },
    ];
    return obj;
  }
}
