/*!
 * ThemeController.js
 * Class ThemeController and implementation.
 *
 * Author: Patrick Goldinger
 * License: MIT
 */

const ThemeController = function (initData) {

    "use strict";

    // private members

    var data = Object.assign({
        bar: document.createElement("div"),
        cookiesAccepted: false,
        name: "default",
        settingsBtn: document.createElement("button"),
        stylesheet: document.createElement("link")
    }, initData);
    var self = this;

    // private methods

    function toggleThemeBar() {
        if (document.body.getAttribute("data-theme-bar") == "hide") {
            document.body.setAttribute("data-theme-bar", "show");
        } else {
            document.body.setAttribute("data-theme-bar", "hide");
        }
    }

    // public methods

    this.loadTheme = function (name) {
        data.name = name.toLowerCase();
            console.log("ThemeController.loadTheme(): Loading theme '" + data.name + "'...");
        data.stylesheet.setAttribute("href", "styles/2048-theme-" + data.name + ".css");
        if (data.cookiesAccepted) {
            Cookies.set("themeName", data.name, { expires: 365 });
        }
        for (let themeButton of data.bar.getElementsByTagName("button")) {
            if (themeButton.getAttribute("data-tooltip").toLowerCase() == data.name) {
                themeButton.setAttribute("data-active", "");
            } else {
                themeButton.removeAttribute("data-active");
            }
        }
    }

    this.initFromCookies = function (ca) {
        data.cookiesAccepted = ca;
        if (typeof Cookies.get("themeName") !== "undefined") {
            this.loadTheme(Cookies.get("themeName"));
        } else if (ca) {
            Cookies.set("themeName", data.name, { expires: 365 });
        }
    }

    this.setCookiesAccepted = function (ca) {
        data.cookiesAccepted = ca;
        if (ca) {
            Cookies.set("themeName", data.name, { expires: 365 });
        } else {
            Cookies.remove("themeName");
        }
    }

    // set event listeners
    
    data.settingsBtn.addEventListener("click", toggleThemeBar, false);
    for (let themeButton of data.bar.getElementsByTagName("button")) {
        themeButton.addEventListener("click", function () {
            self.loadTheme(this.getAttribute("data-tooltip"));
        }, false);
    }

}