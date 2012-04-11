/* 
 * Copyright (C) 2011 B3Partners B.V.
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
        var headercontent = headerobj.textContent;
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

// Default grid config
var defaultGridConfig = {
    autoWidth: true,
    autoHeight: true,
    disableSelection: false,
    loadMask: true,
    viewConfig: {
        trackOver: true,
        stripeRows: true
    }
}
