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