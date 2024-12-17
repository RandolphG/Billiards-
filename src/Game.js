import Machine from "./Machine.js";
import Table from "./Table.js";
import Ball from "./Ball.js";
import Player from "./Player.js";

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

function rel(x) {
  return x + WALL_DI;
}

function initEscapedBodiesRetrieval(allBodies) {
  function hasBodyEscaped(body) {
    let { x, y } = body.position;
    return x < 0 || x > VIEW_W || y < 0 || y > VIEW_H;
  }

  setInterval(() => {
    let i, body;
    for (i = 0; i < allBodies.length; i++) {
      body = allBodies[i];
      if (hasBodyEscaped(body)) game.handleEscapedBall(body.id);
    }
  }, 300);
}

export default class Game {
  constructor({ world, canvas, sounds }) {
    this.machine = new Machine();
    this.sounds = sounds;
    this.world = world;
    this.canvas = canvas;
    this.$score = document.querySelector("div.score");
    this.$message = document.querySelector("div.message");
    this.table = new Table();
    this.balls = {};
    this.ballIds = [];
    this.ballNumbers.forEach((number) => {
      let ball = new Ball({ number, cueball: this.cueball });
      if (ball.cue) this.cueId = ball.body.id;
      if (ball.eight) this.eightId = ball.body.id;
      this.balls[ball.body.id] = ball;
      this.ballIds.push(ball.body.id);
    });
    this.addBodiesToWorld();
    initEscapedBodiesRetrieval(this.ballIds.map((id) => this.balls[id].body));
    this.reset();
  }

  handleEscapedBall(ballId) {
    console.log("ESCAPED", this.balls[ballId]);
    this.balls[ballId].reset();
  }

  reset() {
    this.gameOver = false;
    this.break = true;
    this.mousedown = false;
    this.power = 0;
    this.powerStep = 0.015;
    this.powerDirection = 1;
    this.players = [new Player(1), new Player(2)];
    this.playersAssigned = false;
    this.currentPlayerIdx = 0;

    this.messages = [this.currentPlayer.turnText];

    this.pocketedThisTurn = [];
    this.pocketedStripes = 0;
    this.pocketedSolids = 0;
    this.placingCueball = true;
    this.ballIds.forEach((ballId) => this.balls[ballId].reset());
    this.updateDOM();
  }

  get currentPlayer() {
    return this.players[this.currentPlayerIdx % 2];
  }

  get otherPlayer() {
    return this.players[(this.currentPlayerIdx + 1) % 2];
  }

  get isMachine() {
    return this.currentPlayerIdx % 2 !== 0;
  }

  addBodiesToWorld() {
    World.add(this.world, this.table.bounds);
    World.add(this.world, this.table.walls);
    World.add(this.world, this.table.pockets);
    World.add(
      this.world,
      this.ballIds.map((b) => this.balls[b].body),
    );
  }

  handleMousedown() {
    if (this.gameOver) return;
    if (this.moving) return;
    if (!this.placingCueball) this.mousedown = true;
  }

  handleMouseup() {
    if (this.gameOver) return;
    this.mousedown = false;
    if (this.moving) return;
    if (this.placingCueball) this.placeCueball();
    else this.strikeCueball();
  }

  handlePocketed(ballId) {
    let ball = this.balls[ballId];
    if (ball.cue) this.setupCueball();
    this.handlePocketedBall(ball);
  }

  handlePocketedBall(ball) {
    this.pocketedThisTurn.push(ball);
    let x,
      y = VIEW_H - RETURN_H / 2;
    if (ball.stripes) {
      x = VIEW_W - this.pocketedStripes * (BALL_DI * 1.2) - RETURN_H * 0.5;
      this.pocketedStripes++;
    } else if (ball.solids) {
      x = this.pocketedSolids * (BALL_DI * 1.2) + RETURN_H * 0.5;
      this.pocketedSolids++;
    } else if (ball.cue) {
      x = VIEW_W * 0.5 + BALL_RAD * 1.1;
    } else {
      // ball.eight
      x = VIEW_W * 0.5 - BALL_RAD * 1.1;
    }

    ball.pocket({ x, y });
  }

  handleTickAfter({ x, y }) {
    this.tickPower();
    let power = this.power;
    let wasMoving = this.moving;
    this.checkMovement();
    let isMoving = this.moving;
    if (wasMoving && !isMoving) this.handleTurnEnd();

    let movingCrosshair = { x, y };

    this.canvas.drawTable({
      wallBodies: this.table.walls,
      pocketBodies: this.table.pockets,
    });
    this.canvas.drawBalls({ balls: this.balls, ballIds: this.ballIds });

    let isMachineClick = this.isMachine && this.machine.fire();
    if (this.isMachine) {
      this.machine.tick();
      x = this.machine.x;
      y = this.machine.y;
      power = this.machine.power;
    }

    if (isMachineClick) this.handleMousedown();
    if (this.placingCueball) {
      this.moveCueball(x, y);
    } else if (!this.moving && !this.gameOver) {
      this.canvas.drawIndicator({
        x,
        y,
        power,
        cueball: this.cueball.body,
        maxDistance: this.table.height * 0.5,
      });
    }
    if (isMachineClick) this.handleMouseup();
    if (isMoving || this.isMachine)
      this.canvas.drawMovingCrosshair(movingCrosshair);
    if (!isMoving) this.canvas.drawCrosshair({ x, y });
  }

  handleCollisionActive({ pairs }) {
    pairs.forEach(({ bodyA, bodyB }, i) => {
      let coll = bodyA.label + bodyB.label;
      if (coll === "ballpocket" || coll == "pocketball") {
        let ball = bodyA.label === "ball" ? bodyA : bodyB;
        let distance = Math.hypot(
          bodyA.position.y - bodyB.position.y,
          bodyA.position.x - bodyB.position.x,
        );
        if (distance / BALL_DI <= 1) this.handlePocketed(ball.id);
      }
    });
  }

  handleCollisionStart({ pairs }) {
    if (this.placingCueball) return;
    pairs.forEach((collision, i) => {
      let { bodyA, bodyB } = collision;
      let speed = collision.collision.axisBody.speed;
      let coll = bodyA.label + bodyB.label;
      if (!this.firstContact && coll === "ballball")
        this.firstContact = [bodyA, bodyB];
      if (coll === "ballball") {
        let vol = Math.min(0.5, speed) + 0.05;
        let rate = Math.random() - 0.5 + 1;
        this.sounds.ball.rate(rate);
        this.sounds.ball.volume(vol);
        this.sounds.ball.play();
      } else if (coll === "ballwall" || coll === "wallball") {
        let vol = Math.min(1, speed) * 0.8 + 0.2;
        let rate = Math.random() - 0.5 + 0.75;
        this.sounds.rail.rate(rate);
        this.sounds.rail.volume(vol);
        this.sounds.rail.play();
      }
    });
  }

  // logic for valid first contact, scoring, and game end.
  handleTurnEnd() {
    this.restBalls();
    this.messages = [];
    this.power = 0;
    let pocketed = this.pocketedThisTurn;
    let winner = null;

    let isCue = pocketed.filter((b) => b.cue).length > 0,
      isEight = pocketed.filter((b) => b.eight).length > 0;

    // determining valid first contact
    let validFirstContact = true;
    if (this.firstContact) {
      let balls = this.firstContact.map((b) => this.balls[b.id]);
      let ball = balls.filter((b) => !b.cue)[0];
      if (this.playersAssigned && !isCue && !isEight)
        if (
          (this.currentPlayer.stripes && !ball.stripes) ||
          (this.currentPlayer.solids && !ball.solids)
        )
          validFirstContact = false;
      this.firstContact = null;
    }

    // handling pocketed balls
    if (pocketed.length > 0) {
      let stripes = pocketed.filter((b) => b.stripes),
        solids = pocketed.filter((b) => b.solids),
        hasStripes = stripes.length > 0,
        hasSolids = solids.length > 0;

      // assigning players
      if (!this.playersAssigned) {
        // only assign if one kind of ball went in and cueball and eightball were not pocketed
        if ((!hasStripes || !hasSolids) && !isCue && !isEight) {
          this.currentPlayer.assign(hasStripes);
          this.otherPlayer.assign(!hasStripes);
          this.playersAssigned = true;
        }
      }

      // calculate scores
      if (this.currentPlayer.stripes) {
        this.currentPlayer.score(stripes.length);
        this.otherPlayer.score(solids.length);
      } else if (this.currentPlayer.solids) {
        this.currentPlayer.score(solids.length);
        this.otherPlayer.score(stripes.length);
      }

      // handling game over
      if (isEight) {
        this.messageEight();
        winner = this.currentPlayer.onEight
          ? this.currentPlayer
          : this.otherPlayer;
        // handling cueball
      } else if (isCue) {
        this.messageScratch();
        this.switchTurns();
        // handling invalid contact
      } else if (!validFirstContact) {
        this.messageInvalidContact();
        this.switchTurns();
        // handling the wrong ball
      } else if (
        (!hasStripes && this.currentPlayer.stripes) ||
        (!hasSolids && this.currentPlayer.solids)
      ) {
        this.switchTurns();
      }
      // scratching with no other pocketed balls
    } else if (isCue) {
      this.messageScratch();
      this.switchTurns();
      // switching turns on nothing going in
    } else {
      this.switchTurns();
    }
    // ending the turn
    this.pocketedThisTurn = [];
    if (winner) {
      this.messageWin(winner);
      this.handleGameOver();
    } else {
      this.messageTurn();
    }
    if (this.isMachine) {
      let aMachineBall = this.aMachineBall;
      this.machine.reset(aMachineBall.body.position, this.placingCueball);
    }
    this.updateDOM();
  }

  handleGameOver() {
    this.gameOver = true;
    let $button = document.createElement("button");
    $button.innerHTML = "New Game";
    $button.addEventListener("click", () => {
      $button.remove();
      this.reset();
    });
    document.body.appendChild($button);
  }

  messageTurn() {
    this.messages.push(this.currentPlayer.turnText);
  }

  messageScratch() {
    this.messages.push(this.currentPlayer.scratchText);
  }

  messageInvalidContact() {
    this.messages.push(this.currentPlayer.invalidContactText);
  }

  messageEight() {
    this.messages.push(this.currentPlayer.eightText);
  }

  messageWin(winner) {
    this.messages.push(winner.winText);
  }

  restBalls() {
    this.ballIds.forEach((id) => this.balls[id].rest());
  }

  strikeCueball() {
    this.break = false;
    this.moving = true;
    let power = this.isMachine ? this.machine.power : this.power;
    let vol = Math.min(1, power) * 0.9 + 0.1;
    this.sounds.cue.volume(vol);
    this.sounds.cue.play();
    Body.applyForce(this.cueball.body, this.cueball.body.position, {
      x: this.canvas.forceX,
      y: this.canvas.forceY,
    });
  }

  setupCueball() {
    this.cueball.disable();
    this.placingCueball = true;
  }

  placeCueball() {
    this.cueball.enable();
    this.cueball.pocketed = false;
    this.placingCueball = false;
  }

  moveCueball(x, y) {
    if (this.moving) {
      x = rel(TABLE_W / 2);
      y = rel(TABLE_H + WALL_DI + RETURN_H * 0.5);
    } else {
      let maxX = this.break
          ? rel(TABLE_W / 4 - BALL_RAD)
          : rel(TABLE_W - BALL_RAD),
        minX = rel(0 + BALL_RAD),
        maxY = rel(TABLE_H - BALL_RAD),
        minY = rel(0 + BALL_RAD);
      x = Math.min(maxX, Math.max(minX, x));
      y = Math.min(maxY, Math.max(minY, y));
    }
    this.cueball.setVelocity({ x: 0, y: 0 });
    Body.setPosition(this.cueball.body, { x, y });
  }

  tickPower() {
    if (this.mousedown) {
      this.power += this.powerStep * this.powerDirection;
      if (this.power < 0) {
        this.powerDirection = 1;
        this.power = 0;
      } else if (this.power > 1) {
        this.powerDirection = -1;
        this.power = 1;
      }
    }
  }

  updateDOM() {
    let current = this.currentPlayerIdx % 2;
    this.$score.innerHTML =
      this.updatePlayerDOM(this.players[0], current === 0) +
      this.updatePlayerDOM(this.players[1], current === 1);
    this.$message.innerHTML =
      "<p>" + this.messages.map((m) => m).join(" ") + "</p>";
  }

  updatePlayerDOM(player, current) {
    return `<span>
  <span>${player.nameText}</span>
  <span>${player.points}</span>
</span>`;
  }

  switchTurns() {
    this.currentPlayerIdx++;
  }

  checkMovement() {
    if (this.moving) {
      let moving = false;
      for (let i = 0, len = this.ballIds.length; i < len && !moving; i++) {
        let ballId = this.ballIds[i];
        let ball = this.balls[ballId];
        if (ball.body && ball.body.speed > 0.125) moving = true;
      }
      this.moving = moving;
    }
  }

  get aMachineBall() {
    let balls = this.ballIds
      .map((id) => this.balls[id])
      .filter((b) => !b.pocketed);
    if (this.players[1].onEight) {
      balls = [this.eightball];
    } else if (this.players[1].stripes) {
      balls = balls.filter((b) => b.stripes);
    } else if (this.players[1].solids) {
      balls = balls.filter((b) => b.solids);
    } else {
      balls = balls.filter((b) => !b.cue && !b.eight);
    }
    return balls[Math.floor(Math.random() * balls.length)];
  }

  get cueball() {
    return this.balls[this.cueId];
  }

  get eightball() {
    return this.balls[this.eightId];
  }

  get ballNumbers() {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  }
}
