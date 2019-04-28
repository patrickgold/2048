/*!
 * 2048.js
 * Handling input and Ui drawings.
 *
 * Author: Patrick Goldinger
 * License: MIT
 */


window.addEventListener("load", function () {
    var ele = {
        cookieAcceptBtn: document.getElementById("cookie-accept"),
        cookieDenyBtn: document.getElementById("cookie-deny"),
        cookieSettingsBtn: document.getElementById("cookie-settings-btn"),
        cookieStatus: document.getElementById("cookie-status"),
        endgame: document.getElementById("endgame"),
        fieldspace: document.getElementById("fieldspace"),
        highscore: document.getElementById("highscore"),
        newgameBtn: document.getElementById("newgame"),
        playagainBtn: document.getElementById("playagain"),
        score: document.getElementById("score"),
        themeBar: document.getElementById("theme-bar"),
        themeSettingsBtn: document.getElementById("theme-settings-btn"),
        themeStylesheet: document.getElementById("theme-stylesheet"),
        tryagainBtn: document.getElementById("tryagain")
    };
    var cookiesAccepted = false;
    var initData = null;
    var game = new G2048();
    var highscore = 0;
    var themeName = "default";

    function enableCookies() {
        cookiesAccepted = true;
        Cookies.set("cookiesAccepted", true, { expires: 365 });
        Cookies.set("gameSession", game.isGameRunning() ? game.getDataObject() : null, { expires: 365 });
        Cookies.set("highscore", highscore, { expires: 365 });
        Cookies.set("themeName", themeName, { expires: 365 });
        ele.cookieStatus.innerHTML = "Enabled";
    }
    function disableCookies() {
        cookiesAccepted = false;
        Cookies.set("cookiesAccepted", false, { expires: 365 });
        Cookies.remove("gameSession");
        Cookies.remove("highscore");
        Cookies.remove("themeName");
        ele.cookieStatus.innerHTML = "Disabled";
    }

    // auto cookie read
    if (typeof Cookies.get("cookiesAccepted") !== "undefined") {
        document.body.setAttribute("data-cookie-banner", "hide");
        if (Cookies.get("cookiesAccepted") == "true") {
            cookiesAccepted = true;
            ele.cookieStatus.innerHTML = "Enabled";
            if (typeof Cookies.get("gameSession") !== "undefined") {
                gameSession = Cookies.get("gameSession");
                if (gameSession != "null") {
                    gameSession = JSON.parse(gameSession);
                    ele.score.innerHTML = gameSession.score;
                    initData = gameSession;
                }
            }
            if (typeof Cookies.get("highscore") !== "undefined") {
                ele.highscore.innerHTML = highscore = parseInt(Cookies.get("highscore"), 10);
            }
            if (typeof Cookies.get("themeName") !== "undefined") {
                themeName = Cookies.get("themeName");
            }
        } else {
            cookiesAccepted = false;
            ele.cookieStatus.innerHTML = "Disabled";
        }
    }

    // cookie consent management
    ele.cookieAcceptBtn.addEventListener("click", function () {
        document.body.setAttribute("data-cookie-banner", "hide");
        enableCookies();
    }, false);
    ele.cookieDenyBtn.addEventListener("click", function () {
        document.body.setAttribute("data-cookie-banner", "hide");
        disableCookies();
    }, false);
    ele.cookieSettingsBtn.addEventListener("click", function () {
        if (document.body.getAttribute("data-cookie-banner") == "hide") {
            document.body.setAttribute("data-cookie-banner", "show");
        } else {
            document.body.setAttribute("data-cookie-banner", "hide");
        }
    }, false);

    // Theme management
    function toggleThemeBar() {
        if (document.body.getAttribute("data-theme-bar") == "hide") {
            document.body.setAttribute("data-theme-bar", "show");
        } else {
            document.body.setAttribute("data-theme-bar", "hide");
        }
    }
    ele.themeSettingsBtn.addEventListener("click", toggleThemeBar, false);
    function loadTheme(name) {
        themeName = name.toLowerCase();
            console.log("Loading theme '" + themeName + "'...");
        ele.themeStylesheet.setAttribute("href", "styles/2048-theme-" + themeName + ".css");
        if (cookiesAccepted) {
            Cookies.set("themeName", themeName, { expires: 365 });
        }
        for (let themeButton of ele.themeBar.getElementsByTagName("button")) {
            if (themeButton.getAttribute("data-tooltip").toLowerCase() == themeName) {
                themeButton.setAttribute("data-active", "");
            } else {
                themeButton.removeAttribute("data-active");
            }
        }
    }
    loadTheme(themeName);
    for (let themeButton of ele.themeBar.getElementsByTagName("button")) {
        themeButton.addEventListener("click", function () {
            loadTheme(this.getAttribute("data-tooltip"));
        }, false);
    }

    function updateGameField(container) {
        container.className += " noselect";
        if (ele.fieldspace.getElementsByClassName("G2048").length > 0) {
            ele.fieldspace.replaceChild(container, ele.fieldspace.getElementsByClassName("G2048")[0]);
        } else {
            ele.fieldspace.appendChild(container);
        }
    }
    function initNewGame() {
        game.initializeNew(4);
        updateGameField(game.generateHTML());
        ele.score.innerHTML = 0;
        ele.endgame.setAttribute("data-endgame-box", "disabled");
        if (cookiesAccepted) {
            Cookies.set("gameSession", game.getDataObject(), { expires: 365 });
        }
    }
    function initExtGame() {
        game.initializeFrom(JSON.stringify(initData));
        updateGameField(game.generateHTML());
        ele.endgame.setAttribute("data-endgame-box", "disabled");
    }

    if (initData != null) {
        initExtGame();
    } else {
        initNewGame();
    }

    ele.newgameBtn.addEventListener("click", initNewGame, false);
    ele.playagainBtn.addEventListener("click", initNewGame, false);
    ele.tryagainBtn.addEventListener("click", initNewGame, false);
    
    document.addEventListener("keydown", function (e) {
        e = e || window.event;
        let dir = "none";
        switch (e.keyCode) {
            case 37: // Arrow Left
            case 65: // A
                dir = "left";
                break;

            case 38: // Arrow up
            case 87: // W
                dir = "up";
                break;
            
            case 39: // Arrow right
            case 68: // D
                dir = "right";
                break;
            
            case 40: // Arrow down
            case 83: // S
                dir = "down";
                break;
        }
        // prevent space and arrow scrolling
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
        // handle input if game is running
        if (dir != "none" && game.isGameRunning() && !e.ctrlKey && !e.altKey && !e.shiftKey) {
            game.moveTiles(dir);
            updateGameField(game.generateHTML());
            ele.score.innerHTML = game.getScore();
            if (game.getLastScoreIncrease() >= 2) {
                let scoreIncrease = document.createElement("span");
                scoreIncrease.className = "score-container__increase";
                scoreIncrease.innerHTML = "+" + game.getLastScoreIncrease();
                ele.score.parentElement.appendChild(scoreIncrease);
                setTimeout(function () {
                    scoreIncrease.parentElement.removeChild(scoreIncrease);
                }, 1500);
            }
            if (game.getScore() > highscore) {
                ele.highscore.innerHTML = highscore = game.getScore();
                if (cookiesAccepted) {
                    Cookies.set("highscore", game.getScore(), { expires: 365 });
                }
            }
            if (!game.isGameRunning()) {
                // check if won or lost
                if (game.is2048Reached()) {
                    ele.endgame.setAttribute("data-endgame-box", "win");
                } else {
                    ele.endgame.setAttribute("data-endgame-box", "lose");
                }

                if (cookiesAccepted) {
                    Cookies.set("gameSession", null, { expires: 365 });
                }
            } else {
                if (cookiesAccepted) {
                    Cookies.set("gameSession", game.getDataObject(), { expires: 365 });
                }
            }
        }
    }, false);
}, false);
