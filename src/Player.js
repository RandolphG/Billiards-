class Player {
    constructor(number) {
        this.number = number;
        this.stripes = false;
        this.solids = false;
        this.points = 0;
    }

    get onEight() {
        return this.points === 7;
    }

    get winner() {
        return this.points === 8;
    }

    get denomText() {
        if (this.stripes) return 'Stripes';
        if (this.solids) return 'Solids';
        return '';
    }

    get invalidContactText() {
        if (this.stripes) return `${this.nameText} did not hit a Stripe first.`;
        if (this.solids) return `${this.nameText} did not hit a Solid first.`;
    }

    get nameText() {
        if (this.number === 1) return '<strong>You</strong>';
        return '<strong>AI</strong>';
    }

    get eightText() {
        return `${this.nameText} Pocketed the Eight.`;
    }

    get scratchText() {
        return `${this.nameText} Scratched!`;
    }

    get turnText() {
        let txt = (this.number === 1) ? 'Your' : 'AI\'s';
        txt = `<strong>${txt}</strong>`;
        txt += ' Turn ';
        if (this.stripes || this.solids) txt += `(${this.denomText})`;
        return txt;
    }

    get winText() {
        if (this.number === 1) return '<strong>You</strong> Win!';
        return '<strong>AI</strong> Wins!';
    }

    get teamText() {
        return `${this.nameText} is ${this.denomText}`;
    }

    assign(stripes) {
        stripes ? this.stripes = true : this.solids = true;
    }

    score(count) {
        this.points += count;
    }
}

export default Player;