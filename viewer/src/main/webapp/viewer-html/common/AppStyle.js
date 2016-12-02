/*
 * Copyright (C) 2012-2016 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define("viewer.AppStyle", {

    config: {
        steunkleur1: "",
        steunkleur2: "",
        font: "",
        globalLayout: ""
    },

    CSS_STYLESHEET_ID: "app_layout_stylesheet",

    constructor: function(config) {
        this.initConfig(config);
        var css = this.generateApplicationStyle();
        this.addStylesheet(css);
    },

    addStylesheet: function(css) {
        // Remove stylesheet if it exists
        Ext.util.CSS.removeStyleSheet(this.CSS_STYLESHEET_ID);
        Ext.util.CSS.createStyleSheet(css, this.CSS_STYLESHEET_ID);
    },

    generateApplicationStyle: function() {
        var css = [];
        if(this.config.steunkleur1 && this.config.steunkleur2) {
            css.push(this.generateStyleDeclaration(".x-window-default", [
                "border-color: [steunkleur1]",
                "box-shadow: 0 1px 0 0 [steunkleur1] inset, 0 -1px 0 0 [steunkleur1] inset, -1px 0 0 0 [steunkleur1] inset, 1px 0 0 0 [steunkleur1] inset",
                "background-color: [steunkleur1]"
            ]));

            /* Popup window header */
            css.push(this.generateStyleDeclaration(".x-window-header-default-top", [
                "background-color: [steunkleur1]", /* Header background color */
                "box-shadow: 0 1px 0 0 [steunkleur1] inset, -1px 0 0 0 [steunkleur1] inset, 1px 0 0 0 [steunkleur1] inset"
            ]));

            css.push(this.generateStyleDeclaration(".x-window-header-default", [
                "border-color: [steunkleur1]"
            ]));

            /* Popup content colors */
            css.push(this.generateStyleDeclaration(".x-window-body-default", [
                "background-color: [steunkleur1]", /* Visible when dragging the popup  */
                "border-color: [steunkleur1]" /* Border round the content */
            ]));

            css.push(this.generateStyleDeclaration(".x-window.floating-window", [
                "border-color: #FFFFFF",
                "box-shadow: 0 1px 0 0 #FFFFFF inset, 0 -1px 0 0 #FFFFFF inset, -1px 0 0 0 #FFFFFF inset, 1px 0 0 0 #FFFFFF inset",
                "background-color: #FFFFFF"
            ]));

            css.push(this.generateStyleDeclaration(".x-window.floating-left_menu", [
                "border-color: transparent",
                "box-shadow: none",
                "background-color: transparent"
            ]));

            css.push(this.generateStyleDeclaration(".x-window.floating-window .x-window-header-default-top", [
                "background-color: #FFFFFF", /* Header background color */
                "box-shadow: 0 1px 0 0 #FFFFFF inset, -1px 0 0 0 #FFFFFF inset, 1px 0 0 0 #FFFFFF inset"
            ]));

            /* Popup content colors */
            css.push(this.generateStyleDeclaration(".x-window.floating-window .x-window-body-default", [
                "background-color: #FFFFFF", /* Visible when dragging the popup  */
                "border-color: #FFFFFF" /* Border round the content */
            ]));

            css.push(this.generateStyleDeclaration(".x-window.floating-left_menu .x-window-body-default", [
                "border-color: transparent",
                "background-color: transparent"
            ]));

            /* Panel header colors */
            css.push(this.generateStyleDeclaration(".x-panel-header-default", [
                "background-color: [steunkleur1]",
                "background-image: -moz-linear-gradient(center top, [steunkleur1], [steunkleur1])",
                "background-image: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, [steunkleur1]), color-stop(100%, [steunkleur1]))",
                "background-image: -webkit-linear-gradient(top, [steunkleur1], [steunkleur1])",
                "background-image: -o-linear-gradient(top, [steunkleur1], [steunkleur1])",
                "background-image: -ms-linear-gradient(top, [steunkleur1], [steunkleur1])",
                "background-image: linear-gradient(top, [steunkleur1], [steunkleur1])",
                "border-color: [steunkleur1]"
            ]));

            /* Panel header colors */
            css.push(this.generateStyleDeclaration(".x-panel-header-default-top", [
                "box-shadow: 0 1px 0 0 [steunkleur1] inset"
            ]));

            /* Tool icon background */
            css.push(this.generateStyleDeclaration(".x-tool-img", [
                "background-color: [steunkleur1] !important",
                "color: [steunkleur2]"
            ]));

            /* When using user-defined colors, disable header image in IE */
            css.push(this.generateStyleDeclaration([
                ".x-nlg .x-panel-header-default-top", /* Panel headers */
                ".x-nlg .x-window-default-tl", /* this and below: Popup header and borders */
                ".x-nlg .x-window-default-tc",
                ".x-nlg .x-window-default-tr",
                ".x-nlg .x-window-default-ml",
                ".x-nlg .x-window-default-mc",
                ".x-nlg .x-window-default-mr",
                ".x-nlg .x-window-default-bl",
                ".x-nlg .x-window-default-bc",
                ".x-nlg .x-window-default-br",
                ".x-nlg .x-window-header-default-top-tl",
                ".x-nlg .x-window-header-default-top-tc",
                ".x-nlg .x-window-header-default-top-tr",
                ".x-nlg .x-window-header-default-top-ml",
                ".x-nlg .x-window-header-default-top-mc",
                ".x-nlg .x-window-header-default-top-mr",
                ".x-nlg .x-window-header-default-top-bl",
                ".x-nlg .x-window-header-default-top-bc",
                ".x-nlg .x-window-header-default-top-br"
            ], [
                "background-image: none",
                "background-color: [steunkleur1]"
            ]));

            /* IE9 floating left menu, popup header and borders */
            css.push(this.generateStyleDeclaration([
                ".x-nlg .x-window.floating-left_menu .x-window-default-tl",
                ".x-nlg .x-window.floating-left_menu .x-window-default-tc",
                ".x-nlg .x-window.floating-left_menu .x-window-default-tr",
                ".x-nlg .x-window.floating-left_menu .x-window-default-ml",
                ".x-nlg .x-window.floating-left_menu .x-window-default-mc",
                ".x-nlg .x-window.floating-left_menu .x-window-default-mr",
                ".x-nlg .x-window.floating-left_menu .x-window-default-bl",
                ".x-nlg .x-window.floating-left_menu .x-window-default-bc",
                ".x-nlg .x-window.floating-left_menu .x-window-default-br",
                ".x-nlg .x-window.floating-left_menu .x-window-header-default-top-tl",
                ".x-nlg .x-window.floating-left_menu .x-window-header-default-top-tc",
                ".x-nlg .x-window.floating-left_menu .x-window-header-default-top-tr",
                ".x-nlg .x-window.floating-left_menu .x-window-header-default-top-ml",
                ".x-nlg .x-window.floating-left_menu .x-window-header-default-top-mc",
                ".x-nlg .x-window.floating-left_menu .x-window-header-default-top-mr",
                ".x-nlg .x-window.floating-left_menu .x-window-header-default-top-bl",
                ".x-nlg .x-window.floating-left_menu .x-window-header-default-top-bc",
                ".x-nlg .x-window.floating-left_menu .x-window-header-default-top-br"
            ], [
                "border-color: transparent",
                "background-color: transparent"
            ]));

            /* Panel border */
            css.push(this.generateStyleDeclaration(".x-panel-default", [
                "border-color: [steunkleur1]"
            ]));

            /* Textcolor */
            css.push(this.generateStyleDeclaration([
                ".x-panel-header-text-default", /* Panel headers */
                ".x-window-header-text-default", /* Popup header */
                ".x-panel-header-title-default", /* Panel headers */
                ".x-window-header-title-default" /* Popup headers */
            ], [
                "color: [steunkleur2]"
            ]));

            /* Text color for collapsed side-panels */
            css.push(this.generateStyleDeclaration(".x-panel-header svg text", [
                "fill: [steunkleur2]"
            ]));

            /* Openlayers Overzichtskaartbg */
            css.push(this.generateStyleDeclaration(".olControlOverviewMapElement", [
                "background-color: [steunkleur1] !important"
            ]));

            /* Openlayers Overzichtskaart border */
            css.push(this.generateStyleDeclaration(".olControlOverviewMapExtentRectangle", [
                "border: 2px dotted [steunkleur2] !important"
            ]));
            css.push(this.generateStyleDeclaration(".steunkleur1", [
                "background-color: [steunkleur1]"
            ]));
            css.push(this.generateStyleDeclaration(".steunkleur2", [
                "color: [steunkleur2]"
            ]));
        }
        if(this.config.font) {
            /* Textcolor */
            css.push(this.generateStyleDeclaration([
                ".x-grid-row .x-grid-cell", /* Tree */
                ".x-grid-cell", /* Tree */
                ".x-panel-body-default", /* Panels (tree's, etc.) */
                ".x-panel-header-text-default", /* Panel headers */
                ".x-window-body-default", /* Popup body */
                ".x-border-layout-ct", /* Main containers */
                ".x-body", /* Body class */
                ".x-btn, .x-btn-inner, .x-btn .x-btn-inner", /* Button classes */
                ".x-field", /* Form fields */
                ".x-tab", /* Tabs */
                ".x-tab button", /* Tabs */
                ".x-form-field", /* Form fields */
                ".x-form-item", /* Form items */
                ".x-window-header-text-default" /* Popup header */
            ], [
                "font-family: [font]"
            ]));
        }
        if(this.config.globalLayout.extraCss) {
            css.push(this.config.globalLayout.extraCss);
        }

        css.push(this.createWrapperStyle());

        return css.join(" ");
    },

    createWrapperStyle: function() {
        var wrapperProps = {
            "max-width": this.config.globalLayout.maxWidth,
            "max-height": this.config.globalLayout.maxHeight,
            "padding": this.config.globalLayout.margin,
            "background-color": this.config.globalLayout.backgroundColor,
            "background-image": this.config.globalLayout.backgroundImage,
            "background-repeat": this.config.globalLayout.backgroundRepeat,
            "background-position": this.config.globalLayout.backgroundPosition
        };
        var wrapperStyle = [];
        for(var cssKey in wrapperProps) if(wrapperProps.hasOwnProperty(cssKey)) {
            if(wrapperProps[cssKey]) {
                // Add style property for wrapper
                // In case of max-width/max-height add px
                wrapperStyle.push(
                    [cssKey, ": ", wrapperProps[cssKey], (cssKey === "max-width" || cssKey === "max-height" ? "px" : "")].join("")
                );
            }
        }
        if(wrapperStyle.length) {
            return this.generateStyleDeclaration("#wrapper", wrapperStyle);
        }
        return "";
    },

    generateStyleDeclaration: function(selector, rules) {
        if(Ext.isArray(selector)) {
            selector = selector.join(", ");
        }
        var style = rules.join(";");
        style = style.replace(/\[steunkleur1\]/ig, this.config.steunkleur1);
        style = style.replace(/\[steunkleur2\]/ig, this.config.steunkleur2);
        style = style.replace(/\[font\]/ig, this.config.font);
        return [selector, " { ",  style, "; }" ].join("");
    }

});