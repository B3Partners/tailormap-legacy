/*
 * Copyright (C) 2012-2018 B3Partners B.V.
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
/*
 * Optional wrapper for FeatureInfo as returned by ajax/FeatureInfo
 * FeatureInfo attributes can be an array or an object. This wrapper takes care of the differences and provides unified
 * methods to get the attribute information
 */
Ext.define("viewer.FeatureInfoWrapper", {
    feature: null,
    indexedAttributes: null,
    constructor : function (feature){
        this.feature = feature;
    },
    getAttributes: function() {
        // Backwards compatibility. If the feature is the attributes (old way) use the feature as attribute obj.
        return this.feature.attributes ? this.feature.attributes : this.feature;
    },
    forEachAttribute: function(fn, scope, filteredAttributes) {
        var attributes = this.getAttributes();
        var indexedFilteredAttributes = {};
        for(var i = 0; i < filteredAttributes.length; i++) {
            indexedFilteredAttributes[filteredAttributes[i]] = true;
        }
        if(Ext.isArray(attributes)) {
            for(var j = 0; j < attributes.length; j++) {
                this._executeLoop(attributes[j], fn, scope, indexedFilteredAttributes);
            }
        } else {
            this._executeLoop(attributes, fn, scope, indexedFilteredAttributes);
        }
    },
    _executeLoop: function(attributes, fn, scope, filteredAttributes) {
        for(var key in attributes) if(attributes.hasOwnProperty(key) && !filteredAttributes.hasOwnProperty(key)) {
            fn.call(scope || this, key, attributes[key]);
        }
    },
    getIndexedAttributes: function() {
        if(this.indexedAttributes !== null) {
            return this.indexedAttributes;
        }
        var attributes = this.getAttributes();
        if(Ext.isArray(attributes)) {
            attributes = this.attributeArrayToObject(attributes);
        }
        this.indexedAttributes = attributes;
        return this.indexedAttributes;
    },
    getAttribute: function(key) {
        var attributes = this.getIndexedAttributes();
        return attributes[key] || null;
    },
    getRelatedFeatureTypes: function() {
        return this.getAttribute('related_featuretypes');
    },
    attributeArrayToObject: function(attributes) {
        var attr = {};
        var fa;
        for(var i = 0; i < attributes.length; i++) {
            fa = attributes[i];
            for(var key in fa) if(fa.hasOwnProperty(key)) {
                attr[key] = fa[key];
            }
        }
        return attr;
    }
});