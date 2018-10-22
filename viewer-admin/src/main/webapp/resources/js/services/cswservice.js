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
function searchCsw(){
    var resultDiv = Ext.get("searchResults");
    resultDiv.dom.innerHTML = "";
    resultDiv.mask("Zoeken...");
    var url = Ext.fly("url").getValue();
    var searchTerm = Ext.fly("searchTerm").getValue();
    var me = this;
    Ext.Ajax.request({
        url: actionBeans.csw + "?search=t",
        params: {
            url: url,
            searchTerm: searchTerm
        },
        method: 'POST',
        success: function ( result, request ) {
            var objData = Ext.JSON.decode(result.responseText);
            clearMask()
            if(objData.success){
                var results = objData.results;
                Ext.fly("numresults").dom.innerHTML = "Er zijn " + results.length + " resultaten gevonden.";
                resultDiv.dom.innerHTML = "<ul id='resultList'>";
                for(var i = 0 ; i < results.length ; i++){
                    var cswResult = results[i];
                    addCswResult (cswResult);
                }
                resultDiv.dom.innerHTML += "</ul>";
            }else{
                Ext.MessageBox.alert(i18next.t('viewer_admin_cswservice_0'), result.responseText);
            }
        },
        failure: function ( result, request) {
            Ext.MessageBox.alert(i18next.t('viewer_admin_cswservice_1'), result.responseText);
            clearMask()
        }
    });
}
function clearMask(){
    var resultDiv = Ext.get("searchResults");
    resultDiv.unmask();
}

function addCswResult(item){
    var url = item.url;
    if(url){
        var label = item.label;
        if(label == ""){
            label = url;
        }
        var protocol = item.protocol;
        var resultDiv = Ext.get("resultList");
        var link = "<li><a href='#' onclick='selectResult(\""+url+"\", \"" + protocol +"\")'>"+label+"</a></li>";
        resultDiv.dom.innerHTML += link;
    }
}

function selectResult(serviceUrl,serviceProtocol){
    var category = Ext.get("category").getValue();
    var geoserviceform = document.forms.geoserviceForm;
    geoserviceform.action += "?add=t";
    geoserviceform.url.value = serviceUrl;
    geoserviceform.protocol.value = serviceProtocol;
    geoserviceform.category.value = category;
    geoserviceform.submit();
    
}