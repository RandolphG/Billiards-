const INCH = 12;
const FOOT = INCH * 12;
const TABLE_W = 8 * FOOT;
const TABLE_H = 3.5 * FOOT;
const WALL_DI = 5 * INCH;

function rel(x) {
    return x + WALL_DI;
}

export default class Machine {
    constructor() {
        this.clock = 0;
        this.fireCount = 0;
        this.x = rel(TABLE_W * 0.5);
        this.y = rel(TABLE_H * 0.5);
    }

    reset({ x, y }, placingCueball) {
        if (placingCueball) {
            this.x = rel(TABLE_W * 0.5);
            this.y = rel(TABLE_H * 0.5);
        } else {
            this.x = x;
            this.y = y;
        }
        this.power = 0;
    }

    fire() {
        if (this.fireCount > 100) {
            this.fireCount = 0;
            return true;
        }
        let shouldFire = Math.random() < 0.0125;
        if (shouldFire)
            this.fireCount = 0;
        else
            this.fireCount++;
        return shouldFire;
    }

    tick() {
        let n1 = noise.perlin2(this.clock, this.clock);
        let n2 = noise.perlin2(this.clock + 100, this.clock + 100);
        let n3 = noise.perlin2(this.clock + 1000, this.clock + 1000);
        let max = 16;
        this.x = Math.max(Math.min(this.x + n1 * max, rel(TABLE_W)), rel(0));
        this.y = Math.max(Math.min(this.y + n2 * max, rel(TABLE_H)), rel(0));
        this.clock += 0.02;
        this.power = (n3 + 1) * 0.5 * 0.8 + 0.2;
    }
}

