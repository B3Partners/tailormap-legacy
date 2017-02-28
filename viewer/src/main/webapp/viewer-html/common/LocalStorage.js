/*
 * Copyright (C) 2012-2016 B3Partners B.V.
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

Ext.define("viewer.components.LocalStorage", {

    /**
     * Singleton class
     */
    singleton: true,

    /**
     * Prefixed to all saved items
     */
    itemprefix: "flamingo4_",

    /**
     * Key of resource containing registry of saved items
     */
    itemskey: "flamingo4items",

    /**
     * Registry of saved items
     */
    items: [],

    /**
     * Maximum age of items (in days) after which they are cleared automatically
     */
    maxage: 30,

    /**
     * Bool to track if localStorage is supported
     */
    localStorageSupported: false,

    /**
     * Constructor function
     */
    constructor: function() {
        this.localStorageSupported = this._isLocalStorageSupported();
        if(!this.localStorageSupported) {
            return;
        }
        var items = this._getItem(this.itemskey);
        if(items !== null) {
            this.items = items;
        }
        this._clearOldItems();
    },

    /**
     * Sets item to storage
     * @param {string} key
     * @param {*} value
     */
    setItem: function(key, value) {
        if(!this.localStorageSupported) {
            return;
        }
        key = this._getKey(key);
        var item = {
            "created": new Date(),
            "value": value
        };
        this._setItem(key, item);
    },

    /**
     * Gets item from storage
     * @param {string} key
     * @returns {*}
     */
    getItem: function(key) {
        if(!this.localStorageSupported) {
            return null;
        }
        var item = this._getItem(this._getKey(key));
        if(item === null) {
            return null;
        }
        return item.value;
    },

    /**
     * Removes item from storage
     * @param {string} key
     */
    removeItem: function(key) {
        if(!this.localStorageSupported) {
            return;
        }
        this._removeItem(this._getKey(key));
    },

    /**
     * @param key
     * @param item
     * @private
     */
    _setItem: function(key, item) {
        this._itemAdded(key);
        this._getStorage().setItem(key, Ext.JSON.encode(item));
    },

    /**
     * @param key
     * @returns {*}
     * @private
     */
    _getItem: function(key) {
        var value = this._getStorage().getItem(key);
        if(value === null) {
            return null;
        }
        return Ext.JSON.decode(value);
    },

    /**
     * @param key
     * @private
     */
    _removeItem: function(key) {
        this._getStorage().removeItem(key);
        var idx = Ext.Array.indexOf(this.items, key);
        if(idx !== -1) {
            this.items.splice(idx, 1);
            this._saveItems();
        }
    },

    /**
     * @param key
     * @private
     */
    _itemAdded: function(key) {
        if(Ext.Array.indexOf(this.items, key) !== -1) {
            return;
        }
        this.items.push(key);
        this._saveItems();
    },

    /**
     * @private
     */
    _clearOldItems: function() {
        var item;
        var maxDate = new Date();
        maxDate.setDate(maxDate.getDate() - this.maxage);
        for(var i = 0; i < this.items.length; i++) {
            item = this._getItem(this.items[i]);
            if(item === null || (item && item.created && new Date(item.created) < maxDate)) {
                this._removeItem(this.items[i]);
                this.items.splice(i, 1);
                return this._clearOldItems(); // Call function again to remove others
            }
        }
        this._saveItems();
    },

    /**
     * @private
     */
    _saveItems: function() {
        this._getStorage().setItem(this.itemskey, Ext.JSON.encode(this.items));
    },

    /**
     * @returns {Storage}
     * @private
     */
    _getStorage: function() {
        try {
            return window.localStorage;
        } catch(e) {
            return {};
        }
    },

    /**
     * @param key
     * @returns {string}
     * @private
     */
    _getKey: function(key) {
        return this.itemprefix + key;
    },

    /**
     * @returns {boolean}
     * @private
     */
    _isLocalStorageSupported: function() {
        var testKey = "test";
        try {
            this._getStorage().setItem(testKey, "1");
            this._getStorage().removeItem(testKey);
            return true;
        } catch (error) {
            // Writing can go wrong for example in Safari Private Modus
            return false;
        }
    }
});