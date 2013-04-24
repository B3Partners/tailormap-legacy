/* 
 * Copyright (C) 2013 B3Partners B.V.
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

/*

featureSourceSelect
foreignFeatureSourceSelect

featuretypeSelect
foreignFeaturetypeSelect
*/
Ext.onReady(function(){
    var ft = Ext.get('featureSourceSelect');    
    ft.on('change', function() {
        featureSourceChanged(ft,Ext.get('featuretypeSelect'));
    });                

    var fft = Ext.get('foreignFeatureSourceSelect');
    fft.on('change', function(){
        featureSourceChanged(fft, Ext.get('foreignFeaturetypeSelect'));
    });
    
    // Init with change, because a certain select value can be preselected
    //featureTypeChanged(ft);     
});

function featureSourceChanged(el,resultEl){
    var fsId = parseInt(el.getValue());
    var el = Ext.get('featuretypeSelect');  
    if (fsId < 0 ){
        return;
    }
    Ext.Ajax.request({
        url: featureTypeUrl,
        params: {featureSourceId: fsId},
        success: function(result){
            var response = Ext.JSON.decode(result.responseText);            
            if(response.success) {
                var fts= response.featuretypes;
                var html="<option value=\"-1\">Maak uw keuze.</option>";
                for (var id in fts){
                    var ft=fts[id];       
                    html+="<option value=\""+ft.id+"\"";                    
                    html+=">"+ft.name+"</option>";        
                } 
                resultEl.update(html);
            } else {
                alert(response.error);
            }
        },
        failure: function(result){            
            failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);            
        }
    });    
}
function featureTypeChanged(el){
    var ftId= parseInt(el.getValue());
    if (ftId < 0 ){
        return;
    }
    Ext.Ajax.request({
        url: attributesUrl,
        params: {featureTypeId: ftId},
        success: function(result){
            var response = Ext.JSON.decode(result.responseText);
            var listEl=Ext.get("attributeList");
            if(response.success) {
                var attr= 
                listEl.update("<b>Attributen lijst</b><br/>"+response.attributes.join("<br/>"));
            } else {
                listEl.update(response.error);
            }
        },
        failure: function(result){            
            failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);            
        }
    });
}