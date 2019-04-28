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
const G2048 = function () {

    "use strict";
    
    // private members

    var g = {
        field: [],
        isGameRunning: false,
        isGameValid: false,
        is2048Reached: false,
        lastScoreIncrease: 0,
        score: 0,
        size: 0
    };

    // private methods

    /**
     * Trys to find to equal numbers next to each other.
     */
    function findSameTilePair() {
        for (let y = 0; y < g.size; y++) {
            for (let x = 0; x < g.size; x++) {
                if (x != g.size - 1) {
                    if (g.field[y][x] == g.field[y][x + 1] && g.field[y][x] >= 2) {
                        return true;
                    }
                }
                if (y != g.size - 1) {
                    if (g.field[y][x] == g.field[y + 1][x] && g.field[y][x] >= 2) {
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
     */
    function mergeValues(values) {
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
                    i++;
                } else {
                    i++;
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
        for (let y = 0; y < g.size; y++) {
            let tmpRow = [];
            for (let x = 0; x < g.size; x++) {
                tmpRow[x] = 0;
            }
            g.field[y] = tmpRow;
        }
        // fill two random fields with initial value (2 or 4)
        let f1 = getRandomInt(0, g.size ** 2 - 1);
        g.field[f1 % g.size][Math.floor(f1 / g.size)] = Math.random() > 0.8 ? 4 : 2;
        let f2 = f1;
        while (f1 == f2) {
            f2 = getRandomInt(0, g.size ** 2 - 1);
        }
        g.field[f2 % g.size][Math.floor(f2 / g.size)] = Math.random() > 0.8 ? 4 : 2;
        // game is now valid
        g.isGameRunning = true;
        g.isGameValid = true;
        g.is2048Reached = false;
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
        g = JSON.parse(jsonSave);
        // g.score = 0;
        // g.size = gameSave.size;
        // g.field = gameSave.field;
        // g.isGameRunning = true;
        // g.isGameValid = true;
        // g.is2048Reached = false;
        console.log("G2048.initializeFrom(): Successfully initialized game from given data.");
        return true;
    }

    /**
     * Generates the HTMl structure based on the data in the field.
     * @returns {HTMLElement|null} The HTMLElement or null.
     */
    this.generateHTML = function () {
        if (!g.isGameValid) {
            console.error("At G2048.generateHTML(): Game not in valid state!");
            return null;
        }
        let container = document.createElement("div");
        container.className = "G2048";
        for (let y = 0; y < g.size; y++) {
            let tmpRow = document.createElement("div");
            tmpRow.className = "row";
            for (let x = 0; x < g.size; x++) {
                let tile = document.createElement("div");
                let tileValue = g.field[y][x];
                tile.className = "tile v" + tileValue;
                tile.innerHTML = tileValue == 0 ? "" : tileValue.toString();
                tmpRow.appendChild(tile);
            }
            container.appendChild(tmpRow);
        }
        console.log("G2048.generateHTML(): Successfully generated HTML.");
        return container;
    }

    /**
     * Returns the current game data object.
     */
    this.getDataObject = function () {
        return g;
    }

    /**
     * Returns the current field data.
     */
    this.getField = function () {
        return g.field;
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
        let sthMoved = false;
        switch (direction) {
            case "up":
                for (let x = 0; x < g.size; x++) {
                    let tileValues = [];
                    for (let y = 0; y < g.size; y++) {
                        if (g.field[y][x] >= 2) {
                            tileValues.push(g.field[y][x]);
                        }
                    }
                    mergeValues(tileValues);
                    for (let y = 0; y < g.size; y++) {
                        if (tileValues[y] !== undefined) {
                            g.field[y][x] = tileValues[y];
                        } else {
                            if (g.field[y][x] >= 2) {
                                sthMoved = true;
                            }
                            g.field[y][x] = 0;
                        }
                    }
                }
                break;
            
            case "down":
                for (let x = 0; x < g.size; x++) {
                    let tileValues = [];
                    for (let y = g.size - 1; y >= 0; y--) {
                        if (g.field[y][x] >= 2) {
                            tileValues.push(g.field[y][x]);
                        }
                    }
                    mergeValues(tileValues);
                    for (let y = g.size - 1; y >= 0; y--) {
                        if (tileValues[g.size - y - 1] !== undefined) {
                            g.field[y][x] = tileValues[g.size - y - 1]
                        } else {
                            if (g.field[y][x] >= 2) {
                                sthMoved = true;
                            }
                            g.field[y][x] = 0;
                        }
                    }
                }
                break;
            
            case "left":
                for (let y = 0; y < g.size; y++) {
                    let tileValues = [];
                    for (let x = 0; x < g.size; x++) {
                        if (g.field[y][x] >= 2) {
                            tileValues.push(g.field[y][x]);
                        }
                    }
                    mergeValues(tileValues);
                    for (let x = 0; x < g.size; x++) {
                        if (tileValues[x] !== undefined) {
                            g.field[y][x] = tileValues[x];
                        } else {
                            if (g.field[y][x] >= 2) {
                                sthMoved = true;
                            }
                            g.field[y][x] = 0;
                        }
                    }
                }
                break;
            
            case "right":
                for (let y = 0; y < g.size; y++) {
                    let tileValues = [];
                    for (let x = g.size - 1; x >= 0; x--) {
                        if (g.field[y][x] >= 2) {
                            tileValues.push(g.field[y][x]);
                        }
                    }
                    mergeValues(tileValues);
                    for (let x = g.size - 1; x >= 0; x--) {
                        if (tileValues[g.size - x - 1] !== undefined) {
                            g.field[y][x] = tileValues[g.size - x - 1]
                        } else {
                            if (g.field[y][x] >= 2) {
                                sthMoved = true;
                            }
                            g.field[y][x] = 0;
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
            if (g.field[n % g.size][Math.floor(n / g.size)] == 0) {
                freeSpotCount++;
                if (Math.random() > 0.7 && sthMoved) {
                    g.field[n % g.size][Math.floor(n / g.size)] = Math.random() > 0.8 ? 4 : 2;
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
            if (g.field[n % g.size][Math.floor(n / g.size)] == 0) {
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
