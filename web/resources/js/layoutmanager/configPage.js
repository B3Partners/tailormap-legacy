/* 
 * Copyright (C) 2012 Expression organization is undefined on line 4, column 61 in Templates/Licenses/license-gpl30.txt.
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
if(metadata.configSource != undefined){
    loadConfigSource(metadata.configSource);
    Ext.onReady(function(){
        ConfigSource("config", configObject);
    });
}

function loadConfigSource(url){
    var fileref=document.createElement('script')
    fileref.setAttribute("type","text/javascript")
    fileref.setAttribute("src", contextPath +url)
   
    document.getElementsByTagName("head")[0].appendChild(fileref)
}

function getConfig(){
    var config = getConfigObject();
    
    var configFormObject = Ext.get("configObject");
    configFormObject.dom.value = JSON.stringify( config);
}