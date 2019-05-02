/*!
 * G2048.js
 * Class G2048 and implementation for 2048.
 *
 * Author: Patrick Goldinger
 * License: MIT
 */


/**
 * @class G2048
 * Manages the game field.
 */
const G2048 = function (initElements) {

    "use strict";
    
    // private members

    var g = {
        e: Object.assign({
            field: document.createElement("div")
        }, initElements),
        field: [],
        isGameRunning: false,
        isGameValid: false,
        is2048Reached: false,
        lastScoreIncrease: 0,
        moveAnimationInfo: [],
        score: 0,
        size: 0,
        tID: 0,
        tileMap: []
    };

    // private methods

    /**
     * Trys to find to equal numbers next to each other.
     */
    function findSameTilePair() {
        for (let y = 0; y < g.size; y++) {
            for (let x = 0; x < g.size; x++) {
                if (x != g.size - 1) {
                    if (g.field[y][x].v == g.field[y][x + 1].v && g.field[y][x].v >= 2) {
                        return true;
                    }
                }
                if (y != g.size - 1) {
                    if (g.field[y][x].v == g.field[y + 1][x].v && g.field[y][x].v >= 2) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Generates a random number.
     * @param {number} min Inclusive
     * @param {number} max Inclusive
     */
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Automatically merges values in a row/col.
     * @param {Array.<number>} values The non-zero values in a row/col.
     * @param {Array.<boolean>} hasTileMerged Tells if the tile is a merged one.
     */
    function mergeValues(values, hasTileMerged) {
        let i = 0;
        while (1) {
            if (typeof values[i + 1] !== "undefined") {
                if (values[i] == values[i + 1]) {
                    g.lastScoreIncrease += values[i] * 2;
                    g.score += values[i] * 2;
                    if (values[i] * 2 == 2048) {
                        g.is2048Reached = true;
                    }
                    values[i] = values[i] * 2;
                    values.splice(i + 1, 1); // remove other element
                    hasTileMerged[i++] = true;
                } else {
                    hasTileMerged[i++] = false;
                }
            } else {
                break;
            }
        }
    }

    // public methods

    /**
     * Initializes a new field based on the size of a edge.
     * @param {number} size Must be a number in range [3;8]
     * @returns {boolean} Success of initialization.
     */
    this.initializeNew = function (size) {
        if (typeof size !== "number") {
            console.error("At G2048.initializeNew(): argument 'size' must be of type 'number'!");
            return false;
        } else if (size < 3 || size > 8) {
            console.error("At G2048.initializeNew(): argument 'size' must be in range [3;8]!");
            return false;
        }
        // build up field and fill with zeros (empty tiles) and reset score
        g.score = 0;
        g.size = size;
        g.field = [];
        g.moveAnimationInfo = [];
        for (let y = 0; y < g.size; y++) {
            let tmpRow = [];
            let tmpAnimationRow = [];
            for (let x = 0; x < g.size; x++) {
                tmpRow[x] = { v: 0, tID: g.tID++ };
                tmpAnimationRow[x] = "";
            }
            g.field[y] = tmpRow;
            g.moveAnimationInfo[y] = tmpAnimationRow;
        }
        // fill two random fields with initial value (2 or 4)
        let f1 = getRandomInt(0, g.size ** 2 - 1);
        g.field[f1 % g.size][Math.floor(f1 / g.size)].v = Math.random() > 0.8 ? 4 : 2;
        g.moveAnimationInfo[f1 % g.size][Math.floor(f1 / g.size)] = "n";
        let f2 = f1;
        while (f1 == f2) {
            f2 = getRandomInt(0, g.size ** 2 - 1);
        }
        g.field[f2 % g.size][Math.floor(f2 / g.size)].v = Math.random() > 0.8 ? 4 : 2;
        g.moveAnimationInfo[f2 % g.size][Math.floor(f2 / g.size)] = "n";
        // game is now valid
        g.isGameRunning = true;
        g.isGameValid = true;
        g.is2048Reached = false;
        this.createBaseGrid();
        console.log("G2048.initializeNew(): Successfully initialized game.");
        console.log(g.field);
        return true;
    }
    
    /**
     * Initializes a game field based on a given json-formatted string.
     * @param {string} jsonSave The json-formatted string containing the data.
     * @returns Success of initialization.
     */
    this.initializeFrom = function (jsonSave) {
        if (typeof jsonSave !== "string") {
            console.error("At G2048.initializeFrom(): argument 'jsonSave' must be of type 'string'!");
            return false;
        }
        Object.assign(g, JSON.parse(jsonSave));
        // g.score = 0;
        // g.size = gameSave.size;
        // g.field = gameSave.field;
        // g.isGameRunning = true;
        // g.isGameValid = true;
        // g.is2048Reached = false;
        this.createBaseGrid();
        console.log("G2048.initializeFrom(): Successfully initialized game from given data.");
        return true;
    }

    /**
     * Places the tiles based on the data in the field.
     */
    this.placeTiles = function () {
        if (!g.isGameValid) {
            console.error("At G2048.placeTiles(): Game not in valid state!");
            return;
        }
        /** @type {HTMLDivElement} */
        let container = g.e.field;
        let oldTiles = container.getElementsByClassName("tile");
        while (oldTiles[0]) {
            oldTiles[0].parentNode.removeChild(oldTiles[0]);
        }
        for (let y = 0; y < g.size; y++) {
            for (let x = 0; x < g.size; x++) {
                let tileValue = g.field[y][x].v;
                let tID = g.field[y][x].tID;
                if (tileValue < 2) {
                    continue;
                }
                let tile = document.createElement("div");
                tile.classList.add("tile");
                tile.classList.add("v" + tileValue);
                tile.setAttribute("data-tid", tID);
                if (g.moveAnimationInfo[y][x] == "n") {
                    tile.classList.add("new");
                } else if (g.moveAnimationInfo[y][x] == "m") {
                    tile.classList.add("merged");
                }
                tile.innerHTML = tileValue.toString();
                tile.style.left = 12 * (x + 1) + 60 * x + "px";
                tile.style.top = 12 * (y + 1) + 60 * y + "px";
                container.appendChild(tile);
            }
        }
        console.log("G2048.placeTiles(): Successfully placed tiles.");
    }

    /**
     * Creates the base grid based on the size of the field.
     */
    this.createBaseGrid = function () {
        if (!g.isGameValid) {
            console.error("At G2048.createBaseGrid(): Game not in valid state!");
            return;
        }
        let baseGridRows = g.e.field.getElementsByClassName("base-grid-row");
        while (baseGridRows[0]) {
            baseGridRows[0].parentNode.removeChild(baseGridRows[0]);
        }
        for (let y = 0; y < g.size; y++) {
            let tmpRow = document.createElement("div");
            tmpRow.className = "base-grid-row";
            for (let x = 0; x < g.size; x++) {
                let tile = document.createElement("div");
                tile.classList.add("tile-empty");
                tmpRow.appendChild(tile);
            }
            g.e.field.appendChild(tmpRow);
        }
        console.log("G2048.createBaseGrid(): Successfully created base grid.");
    }

    /**
     * Returns the current game data object.
     */
    this.getDataObject = function () {
        return Object.assign({}, g, { e: undefined, tileMap: undefined });
    }

    /**
     * Returns the last available score increase.
     */
    this.getLastScoreIncrease = function () {
        return g.lastScoreIncrease;
    }

    /**
     * Returns the current score.
     */
    this.getScore = function () {
        return g.score;
    }

    /**
     * Reports if the game is currently running.
     */
    this.isGameRunning = function () {
        return g.isGameRunning;
    }

    /**
     * Reports if the game is valid.
     */
    this.is2048Reached = function () {
        return g.is2048Reached;
    }

    /**
     * Reports if 2048 has been reched.
     */
    this.isGameValid = function () {
        return g.isGameValid;
    }

    /**
     * Move tiles in field based on direction.
     * @param {string} direction The direction of the move ("up", "down", "left" or "right").
     * @returns {boolean} Success of move.
     */
    this.moveTiles = function (direction) {
        if (!g.isGameValid) {
            console.error("At G2048.moveTiles(): Game not in valid state!");
            return false;
        } else if (!g.isGameRunning) {
            console.error("At G2isGameValid.moveTiles(): Game not in running state!");
            return false;
        }
        g.lastScoreIncrease = 0;
        g.moveAnimationInfo = [];
        for (let y = 0; y < g.size; y++) {
            let tmpAnimationRow = [];
            for (let x = 0; x < g.size; x++) {
                tmpAnimationRow[x] = "";
            }
            g.moveAnimationInfo[y] = tmpAnimationRow;
        }
        let sthMoved = false;
        switch (direction) {
            case "up":
                for (let x = 0; x < g.size; x++) {
                    let tileValues = [];
                    let hasTileMerged = [];
                    for (let y = 0; y < g.size; y++) {
                        if (g.field[y][x].v >= 2) {
                            tileValues.push(g.field[y][x].v);
                        }
                    }
                    mergeValues(tileValues, hasTileMerged);
                    for (let y = 0; y < g.size; y++) {
                        if (tileValues[y] !== undefined) {
                            g.field[y][x].v = tileValues[y];
                            if (hasTileMerged[y]) {
                                g.moveAnimationInfo[y][x] = "m";
                            }
                        } else {
                            if (g.field[y][x].v >= 2) {
                                sthMoved = true;
                            }
                            g.field[y][x].v = 0;
                        }
                    }
                }
                break;
            
            case "down":
                for (let x = 0; x < g.size; x++) {
                    let tileValues = [];
                    let hasTileMerged = [];
                    for (let y = g.size - 1; y >= 0; y--) {
                        if (g.field[y][x].v >= 2) {
                            tileValues.push(g.field[y][x].v);
                        }
                    }
                    mergeValues(tileValues, hasTileMerged);
                    for (let y = g.size - 1; y >= 0; y--) {
                        if (tileValues[g.size - y - 1] !== undefined) {
                            g.field[y][x].v = tileValues[g.size - y - 1];
                            if (hasTileMerged[g.size - y - 1]) {
                                g.moveAnimationInfo[y][x] = "m";
                            }
                        } else {
                            if (g.field[y][x].v >= 2) {
                                sthMoved = true;
                            }
                            g.field[y][x].v = 0;
                        }
                    }
                }
                break;
            
            case "left":
                for (let y = 0; y < g.size; y++) {
                    let tileValues = [];
                    let hasTileMerged = [];
                    for (let x = 0; x < g.size; x++) {
                        if (g.field[y][x].v >= 2) {
                            tileValues.push(g.field[y][x].v);
                        }
                    }
                    mergeValues(tileValues, hasTileMerged);
                    for (let x = 0; x < g.size; x++) {
                        if (tileValues[x] !== undefined) {
                            g.field[y][x].v = tileValues[x];
                            if (hasTileMerged[x]) {
                                g.moveAnimationInfo[y][x] = "m";
                            }
                        } else {
                            if (g.field[y][x].v >= 2) {
                                sthMoved = true;
                            }
                            g.field[y][x].v = 0;
                        }
                    }
                }
                break;
            
            case "right":
                for (let y = 0; y < g.size; y++) {
                    let tileValues = [];
                    let hasTileMerged = [];
                    for (let x = g.size - 1; x >= 0; x--) {
                        if (g.field[y][x].v >= 2) {
                            tileValues.push(g.field[y][x].v);
                        }
                    }
                    mergeValues(tileValues, hasTileMerged);
                    for (let x = g.size - 1; x >= 0; x--) {
                        if (tileValues[g.size - x - 1] !== undefined) {
                            g.field[y][x].v = tileValues[g.size - x - 1];
                            if (hasTileMerged[g.size - x - 1]) {
                                g.moveAnimationInfo[y][x] = "m";
                            }
                        } else {
                            if (g.field[y][x].v >= 2) {
                                sthMoved = true;
                            }
                            g.field[y][x].v = 0;
                        }
                    }
                }
                break;

            default:
                break;
        }
        // check if 2048 is reached.
        if (g.is2048Reached) {
            g.isGameRunning = false;
            return true;
        }
        // find free spot to create new random tile value
        let freeSpotCount = 0;
        for (let n = 0; n < g.size ** 2; n++) {
            if (g.field[n % g.size][Math.floor(n / g.size)].v == 0) {
                freeSpotCount++;
                if (Math.random() > 0.7 && sthMoved) {
                    g.field[n % g.size][Math.floor(n / g.size)] = { v: Math.random() > 0.8 ? 4 : 2, tID: g.tID++ };
                    g.moveAnimationInfo[n % g.size][Math.floor(n / g.size)] = "n";
                    break;
                } else if ((n == g.size ** 2 - 1) && sthMoved) {
                    n = -1; // reset counter
                }
            } else if (n == g.size ** 2 - 1 && freeSpotCount > 0 && sthMoved) {
                n = -1; // reset counter
            }
        }
        // Now count that free spots again.
        freeSpotCount = 0;
        for (let n = 0; n < g.size ** 2; n++) {
            if (g.field[n % g.size][Math.floor(n / g.size)].v == 0) {
                freeSpotCount++;
            }
        }
        if (freeSpotCount == 0 && !findSameTilePair()) {
            g.isGameRunning = false;
        }
        console.log("G2048.moveTiles(): Successfully moved tiles.")
        return true;
    }
}
