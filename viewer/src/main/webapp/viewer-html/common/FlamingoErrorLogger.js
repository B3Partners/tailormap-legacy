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

(function(window) {
    window.createFlamingoErrorLogger = function(appName, appId, errorUrl) {
        function flamingoLogFn(messageOrEvent, source, lineno, colno) {
            try {
                var request = null;
                var error = [];
                var basedata = [
                    "Application " + appName + " (" + appId + ")",
                    window.location
                ];
                if(window.navigator) {
                    basedata.push(window.navigator.userAgent);
                    basedata.push(window.navigator.platform);
                }
                error.push(basedata.join(" - "));

                if(typeof messageOrEvent === "string") {
                    error.push(messageOrEvent);
                    if(source) {
                        error.push("Source: " + source);
                    }
                    if(lineno) {
                        error.push("Line: " + lineno + "," + colno);
                    }
                } else if(messageOrEvent instanceof Error) {
                    error.push(messageOrEvent.name, messageOrEvent.message, messageOrEvent.stack, "Line: " + messageOrEvent.lineNumber + "," + messageOrEvent.columnNumber);
                } else {
                    error.push(messageOrEvent);
                }

                if (window.XMLHttpRequest) {
                    request = new XMLHttpRequest();
                } else if (window.ActiveXObject) { // IE
                    try {
                        request = new ActiveXObject('Msxml2.XMLHTTP');
                    }
                    catch (e) {
                        try {
                            request = new ActiveXObject('Microsoft.XMLHTTP');
                        }
                        catch (e) {}
                    }
                }
                if(request !== null) {
                    request.open('POST', errorUrl, true);
                    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    request.send('msg=' + encodeURIComponent(error.join("\n\t")));
                }
            } catch(e) {}
        }
        return flamingoLogFn;
    }
})(window);