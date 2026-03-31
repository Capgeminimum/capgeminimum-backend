function elo_adder(eloA, eloB, result) {
    const base = 10;
    const factor = 1 + (Math.abs(eloA - eloB) / 1000);
    let val = 0;
    if ((result === 1 && eloA > eloB) || (result === -1 && eloA < eloB)) {
        val = base ** (1 / factor) * 1000 / eloA;
    } else if ((result === -1 && eloA > eloB) || (result === 1 && eloA < eloB)) {
        val = base ** factor * 1000 / eloA;
    } else {
        return base * 1000 / eloA;
    }
    return val * result;

}


export {elo_adder};