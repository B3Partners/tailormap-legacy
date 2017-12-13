/* 
 * Copyright (C) 2012-2017 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * This file contains overrides for Ext bugs and behaviour.
 * For every new Ext release we should check if these are still necessary
 */


/*
 This fixes an issue where Ext logs errors when using the map on touch enabled devices
 */
Ext.define('viewer.overrides.dom.TouchAction', {
    override: 'Ext.dom.TouchAction',
    fixEvent: function(e) {
        if(!e.touches) e.touches = [];
        return e;
    },
    onTouchStart: function(e) {
        this.callParent([this.fixEvent(e)]);
    },
    onTouchMove: function(e) {
        this.callParent([this.fixEvent(e)]);
    },
    onTouchEnd: function(e) {
        this.callParent([this.fixEvent(e)]);
    }
    });
/*
 Fixes an issue in Chrome since default settings for passive have changed since Chrome 56, see
 - https://www.chromestatus.com/features/5093566007214080
 - https://www.sencha.com/forum/showthread.php?337938-6-2-1-classic-ComboBox-useless-since-Chrome-56-on-touch
 In the future this might also be implemented by other browsers, for now we only execute this for Chrome
 */
if(Ext.browser.is.Chrome || Ext.browser.is.ChromeMobile) {
    Ext.define('Ext.overrides.event.publisher.Dom', {
        override: 'Ext.event.publisher.Dom'
    }, function(DomPublisher) {
        var hasListenerOptions = false;
        try {
            // Check if browser supports options object for addEventListener
            window.addEventListener('options-test', null, Object.defineProperty({}, 'capture', {
                get: function() {
                    hasListenerOptions = true;
                }
            }));
        } catch(e) {}
        DomPublisher.override({
            addDelegatedListener: function(eventName) {
                if (hasListenerOptions && /^touch(start|end|move)$/.test(eventName) && this.target instanceof Window) {
                    this.delegatedListeners[eventName] = 1;
                    this.target.addEventListener(
                        eventName, this.onDelegatedEvent, {
                            passive: false, // override default value for Chrome 56
                            capture: !!this.captureEvents[eventName]
                        }
                    );
                    return;
                }
                this.callParent([eventName]);
            }
    });
    });
}
/*
 For mobile devices it makes more sense to disable editable comboboxes so the user does not get a virtual
 keyboard everytime the user interacts with a combobox
 */
if(Ext.os.deviceType !== "Desktop") {
    // Manually set the prototype value. Using Ext.override seems to break comboboxes
    if(Ext.form.field.ComboBox
        && Ext.form.field.ComboBox.prototype
        && Ext.form.field.ComboBox.prototype.defaultConfig) {
        Ext.form.field.ComboBox.prototype.defaultConfig.editable = false;
    }
}
/**
 * Override drawText function on openlayers SVG.js
 * This override adds label rotation
 */
OpenLayers.Renderer.SVG.prototype.drawText = function(featureId, style, location) {
    var drawOutline = (!!style.labelOutlineWidth);
    // First draw text in halo color and size and overlay the
    // normal text afterwards
    if (drawOutline) {
        var outlineStyle = OpenLayers.Util.extend({}, style);
        outlineStyle.fontColor = outlineStyle.labelOutlineColor;
        outlineStyle.fontStrokeColor = outlineStyle.labelOutlineColor;
        outlineStyle.fontStrokeWidth = style.labelOutlineWidth;
        delete outlineStyle.labelOutlineWidth;
        this.drawText(featureId, outlineStyle, location);
}

    var resolution = this.getResolution();

    var x = ((location.x - this.featureDx) / resolution + this.left);
    var y = (location.y / resolution - this.top);

    var suffix = (drawOutline)?this.LABEL_OUTLINE_SUFFIX:this.LABEL_ID_SUFFIX;
    var label = this.nodeFactory(featureId + suffix, "text");

    label.setAttributeNS(null, "x", x);
    label.setAttributeNS(null, "y", -y);

    if (style.fontColor) {
        label.setAttributeNS(null, "fill", style.fontColor);
    }
    if (style.fontStrokeColor) {
        label.setAttributeNS(null, "stroke", style.fontStrokeColor);
    }
    if (style.fontStrokeWidth) {
        label.setAttributeNS(null, "stroke-width", style.fontStrokeWidth);
    }
    if (style.fontOpacity) {
        label.setAttributeNS(null, "opacity", style.fontOpacity);
    }
    if (style.fontFamily) {
        label.setAttributeNS(null, "font-family", style.fontFamily);
    }
    if (style.fontSize) {
        label.setAttributeNS(null, "font-size", style.fontSize);
    }
    if (style.fontWeight) {
        label.setAttributeNS(null, "font-weight", style.fontWeight);
    }
    if (style.fontStyle) {
        label.setAttributeNS(null, "font-style", style.fontStyle);
    }
    if (style.labelSelect === true) {
        label.setAttributeNS(null, "pointer-events", "visible");
        label._featureId = featureId;
    } else {
        label.setAttributeNS(null, "pointer-events", "none");
    }
    if (style.rotation) {
        label.setAttributeNS(null, "transform",
            'rotate(' + style.rotation + ',' + x + ',' + -y + ')'
);
    }
    var align = style.labelAlign || OpenLayers.Renderer.defaultSymbolizer.labelAlign;
    label.setAttributeNS(null, "text-anchor",
        OpenLayers.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");

    if (OpenLayers.IS_GECKO === true) {
        label.setAttributeNS(null, "dominant-baseline",
            OpenLayers.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
    }

    var labelRows = style.label.split('\n');
    var numRows = labelRows.length;
    while (label.childNodes.length > numRows) {
        label.removeChild(label.lastChild);
    }
    for (var i = 0; i < numRows; i++) {
        var tspan = this.nodeFactory(featureId + suffix + "_tspan_" + i, "tspan");
        if (style.labelSelect === true) {
            tspan._featureId = featureId;
            tspan._geometry = location;
            tspan._geometryClass = location.CLASS_NAME;
        }
        if (OpenLayers.IS_GECKO === false) {
            tspan.setAttributeNS(null, "baseline-shift",
                OpenLayers.Renderer.SVG.LABEL_VSHIFT[align[1]] || "-35%");
        }
        tspan.setAttribute("x", x);
        if (i == 0) {
            var vfactor = OpenLayers.Renderer.SVG.LABEL_VFACTOR[align[1]];
            if (vfactor == null) {
                vfactor = -.5;
            }
            tspan.setAttribute("dy", (vfactor*(numRows-1)) + "em");
        } else {
            tspan.setAttribute("dy", "1em");
        }
        tspan.textContent = (labelRows[i] === '') ? ' ' : labelRows[i];
        if (!tspan.parentNode) {
            label.appendChild(tspan);
        }
    }

    if (!label.parentNode) {
        this.textRoot.appendChild(label);
    }
};
