/* 
 * Copyright (C) 2012-2013 B3Partners B.V.
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
/**
 * Zoom component
 * Creates a MapComponent Tool with the given configuration by calling createTool 
 * of the MapComponent
 * @author <a href="mailto:geertplaisier@b3partners.nl">Geert Plaisier</a>
 */
Ext.define ("viewer.components.tools.Zoom",{
    extend: "viewer.components.tools.Tool",
    config:{},
    constructor: function (conf) {
        this.initConfig(conf);
		viewer.components.tools.Zoom.superclass.constructor.call(this, this.config);
        conf.type = viewer.viewercontroller.controller.Tool.ZOOM;
        this.initTool(conf);
        this.alignContainer(Ext.get(this.tool.frameworkObject.div));
        this.initSvg(Ext.get(this.tool.frameworkObject.div));
        this.tool.blocksDefaultTool = false;
        return this;
    },

    initSvg : function (container){
        if(!this.config.viewerController.hasSvgSprite()) {
            return;
        }
        var appSprite = this.config.viewerController.getApplicationSprite();
        function addSvgIcon(el, cls) {
            el.setHtml([
                '<svg role="img" title=""><use xlink:href="',
                appSprite,
                '#icon-',
                cls,
                '"/></svg>'
            ].join(""));
            el.addCls('svg-tool');
        }
        addSvgIcon(container.select('.olControlZoomIn'), "zoomin");
        addSvgIcon(container.select('.olControlZoomOut'), "zoomout");
    },
    
    alignContainer: function(container) {
        if(!this.config.left) {
            this.config.left = 10;
        }
        if(!this.config.top) {
            this.config.top = 10;
        }
        var pos = [Number(this.config.left), Number(this.config.top)];
        var align = 'tl';
        if(this.config.alignposition) {
            align = this.config.alignposition;
        }
        if(align.substr(0, 1) === 'b') {
            pos[1] = pos[1] * -1;
        }
        if(align.substr(1) === 'r') {
            pos[0] = pos[0] * -1;
        }
        var map = Ext.get(this.config.viewerController.layoutManager.mapId);
        container.alignTo(map, [align, align].join('-'), pos);
        container.anchorTo(map, [align, align].join('-'), pos);
    }
});

