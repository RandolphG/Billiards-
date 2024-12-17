import Game from "./Game.js";
import Canvas from "./Canvas.js";

console.clear();

noise.seed(Math.random() * 1000);

const ASSET_PREFIX = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/111863/";

const PI = Math.PI,
  PI2 = PI * 2;

const // module aliases
  Engine = Matter.Engine,
  Events = Matter.Events,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint,
  Render = Matter.Render;

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

// create a world and engine
let world = World.create({ gravity: { x: 0, y: 0 } });
let engine = Engine.create({ world, timing: { timeScale: 1 } });

// create a renderer
let element = document.querySelector("div.canvas");
let render = Render.create({
  element,
  engine,
  options: {
    width: VIEW_W,
    height: VIEW_H,
    wireframes: WIREFRAMES,
    background: COLORS.frame,
  },
});

if (window.location.href.match(/cpgrid/)) {
  document.body.classList.add("screenshot");
  let src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/111863/billiards.png";
  let img = new Image();
  img.src = src;
  document.body.appendChild(img);
} else {
  let canvas = new Canvas(render);
  let mouse = Mouse.create(render.canvas);
  let sounds = {
    cue: new Howl({
      src: [
        ASSET_PREFIX + "billiards-cue.mp3",
        ASSET_PREFIX + "billiards-cue.ogg",
      ],
    }),
    ball: new Howl({
      src: [
        ASSET_PREFIX + "billiards-ball.mp3",
        ASSET_PREFIX + "billiards-ball.ogg",
      ],
    }),
    rail: new Howl({
      src: [
        ASSET_PREFIX + "billiards-rail.mp3",
        ASSET_PREFIX + "billiards-rail.ogg",
      ],
    }),
  };

  let game = new Game({ world, canvas, sounds });

  Events.on(render, "afterRender", () => {
    game.handleTickAfter({ x: mouse.position.x, y: mouse.position.y });
  });

  let constraint = MouseConstraint.create(engine, { mouse });
  Events.on(constraint, "mousedown", ({ mouse }) => {
    game.handleMousedown();
  });
  Events.on(constraint, "mouseup", ({ mouse }) => {
    game.handleMouseup();
  });

  Events.on(engine, "collisionActive", (e) => {
    game.handleCollisionActive({ pairs: e.pairs });
  });

  Events.on(engine, "collisionStart", (e) => {
    game.handleCollisionStart({ pairs: e.pairs });
  });

  // run the engine
  Engine.run(engine);

  // run the renderer
  Render.run(render);
}
