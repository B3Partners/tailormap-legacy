/*
 * Copyright (C) 2011-2013 B3Partners B.V.
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

// Get parent function for iframes / popups
function getParent() {
    if (window.opener){
        return window.opener;
    }else if (window.parent){
        return window.parent;
    }else{
        return window;
    }
}

function appendPanel(header, content, container) {
    var headerobj = document.getElementById(header);
    var contentobj = document.getElementById(content);
    if(headerobj && contentobj) {
        var headercontent = headerobj.innerText || headerobj.textContent;
        headerobj.style.display = 'none';
        contentobj.className += ' insidePanel';

        var panelContainer = container || Ext.getBody();
        var panel = Ext.create('Ext.panel.Panel', {
            title: headercontent,
            contentEl: contentobj,
            width: '100%',
            renderTo: panelContainer
        });
        Ext.EventManager.onWindowResize(function () {
            panel.doLayout();
        });
    }
}

/**
*  Apply fixes to the trees for ExtJS scrolling issues
*/
function applyTreeScrollFix(view) {
    view.getEl().setStyle({
        overflow: 'auto',
        overflowX: 'auto'
    });
    // From ext-all-debug, r77661 & r77663
    // Seems to recalculate body and applies correct heights so scrollbars can be shown
    view.panel.doComponentLayout();
    view.panel.getLayout().layout();
}

var helpController = null,
    iFramePopupController = null;
Ext.onReady(function() {
    iFramePopupController = Ext.create('Ext.b3p.iFramePopupController');
    helpController = Ext.create('Ext.b3p.HelpController', {
        helppath: helppath
    });
    var helpLinks = Ext.select('.helplink');
    if(helpLinks.getCount() > 0) {
        helpLinks.on('click', function(evt, htmlel, eOpts) {
            helpController.showHelp(htmlel);
        }, '', {
            stopEvent: true
        });
    }
});

Ext.define('Ext.b3p.iFramePopupController', {
    iframe: null,
    constructor: function(conf) {
        var me = this;
        me.initConfig(conf);
        me.iframeid = Ext.id();
        me.popupWindow = Ext.create('Ext.window.Window', {
            closeAction: 'hide',
            hideMode: 'offsets',
            width: 600,
            height: 400,
            layout: 'fit',
            renderTo: Ext.getBody(),
            bodyStyle: {
                background: '#FFFFFF'
            },
            items : [{
                id: me.iframeid,
                xtype : "component",
                autoEl : {
                    tag : "iframe",
                    style: "border: 0px none;",
                    frameborder: 0
                }
            }]
        });
    },
    getIframe: function() {
        var me = this;
        if(me.iframe === null) me.iframe = Ext.get(me.iframeid);
        return me.iframe;
    },
    loadPage: function(url, frametitle) {
        var me = this;
        var iframe = me.getIframe();
        if(!frametitle) frametitle = '';
        if(iframe) {
            iframe.set({ src: url });
            me.popupWindow.setTitle(frametitle);
            me.popupWindow.show();
        }
    }
});

Ext.define('Ext.b3p.HelpController', {
    extend: "Ext.b3p.iFramePopupController",
    helppath: helppath,
    constructor: function(conf) {
        Ext.b3p.HelpController.superclass.constructor.call(this, conf);
    },
    showHelp: function(htmlel) {
        var me = this;
        var extel = Ext.fly(htmlel);
        var hash = extel.getAttribute('href');
        // IE fix, href in IE8 and lower is the complete URL + hash, not just the hash
        hash = hash.substring(hash.lastIndexOf('#'));
        var iframeurl = me.helppath + hash;
        me.loadPage(iframeurl, 'Help');
    }
});

// Default grid config
var defaultGridConfig = {
    autoWidth: true,
    height: '100%',
    disableSelection: false,
    loadMask: true,
    viewConfig: {
        trackOver: true,
        stripeRows: true
    }
};

// Default config for HTML-editor image uploader
var defaultImageUploadConfig = {
    dragResize: false,
    dragWheel: false,
    disableServerSideEdit: true,
    lang: {
        'Display': 'Weergave',
        'By Default': 'Standaard',
        'Inline': 'In regel',
        'Block': 'Op aparte regel',
        'Insert/Edit Image': 'Afbeelding invoegen/bewerken',
        'Upload Image...': 'Uploaden...',
        'Uploading your photo...': 'Afbeelding wordt geupload...',
        'Error': 'Fout',
        'Width': 'Breedte',
        'Height': 'Hoogte',
        'Real Size': 'Originele grootte',
        'Align': 'Uitlijning',
        'Title': 'Titel',
        'Class': '',
        'Padding': '',
        'Margin': '',
        'Top': 'Boven',
        'Bottom': 'Onder',
        'Right': 'Rechts',
        'Left': 'Links',
        'None': 'Geen',
        'Size & Details': 'Grootte en details',
        'More Options': 'Meer opties',
        'Style' : 'Stijl',
        'OK' : '',
        'Cancel': 'Annuleren',
        'Delete Image':'Afbeelding verwijderen',
        'Confirmation':'Bevestiging',
        'Are you sure you want to delete this image?': 'Weet u zeker dat u deze afbeelding wilt verwijderen?',
        'Your photo has been uploaded.':'Uw afbeelding is geupload.'
    }
};

var defaultHtmleditorTableConfig = {
    langTitle: 'Tabel toevoegen',
    langInsert: 'Invoegen',
    langCancel: 'Annuleren',
    langRows: 'Rijen',
    langColumns: 'Kolommen',
    langBorder: 'Rand',
    langCellLabel: 'Label in cellen tonen'
};