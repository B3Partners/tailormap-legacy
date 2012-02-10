/* 
 * Copyright (C) 2012 B3Partners B.V.
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
 * Superclass for the classes that create configuration elements for a component.
 */
Ext.define("viewer.components.ConfigObject",{
    parentId: null,
    configObject: null,
    formWidth: 760,
    labelWidth: 300,
    formPadding: 5,
    constructor: function (parentId,configObject){
        this.parentId=parentId;
        this.configObject=configObject;
        if (configObject==null || configObject==undefined){
            this.configObject=new Object();
        }
    },
    /**
     * Must return the configuration that is set by the user.
     */
    getConfiguration: function(){
        Ext.Error.raise("getConfigObject() must be implemented in subclass of \"viewer.components.ConfigObject\" ");
    }
});

