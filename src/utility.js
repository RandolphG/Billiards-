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

const WIREFRAMES = false;
const INCH = 12;
const FOOT = INCH * 12;
const TABLE_W = 8 * FOOT;
const WALL_DI = 5 * INCH;
const TABLE_H = 3.5 * FOOT;
const BALL_DI = 2.4375 * INCH;
const BALL_RAD = BALL_DI / 2;
const RETURN_H = BALL_DI * 1.75;
const VIEW_W = WALL_DI * 2 + TABLE_W;
const VIEW_H = WALL_DI * 2 + TABLE_H + RETURN_H;
const World = Matter.World;
const Body = Matter.Body;

export default {
  WIREFRAMES,
  COLORS,
  INCH,
  FOOT,
  TABLE_H,
  TABLE_W,
  WALL_DI,
  BALL_DI,
  BALL_RAD,
  RETURN_H,
  VIEW_H,
  VIEW_W,
  World,
  Body,
};
