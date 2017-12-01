/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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

if(typeof MobileManager !== "undefined" && MobileManager.isMobile()) {
    Ext.override(Ext.form.field.ComboBox, {
        editable: false 
    });
    Ext.override(Ext.form.field.Trigger, {
        editable: false 
    });
}

Ext.override(Ext.form.field.HtmlEditor, 
    // Fix upside down question mark appearing
    // http://www.sencha.com/forum/showthread.php?79190-Mysterious-postdata-from-htmleditor
    { defaultValue: "" }
);

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
