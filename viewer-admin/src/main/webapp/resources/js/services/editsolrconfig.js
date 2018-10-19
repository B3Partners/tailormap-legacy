/* 
 * Copyright (C) 2013 B3Partners B.V.
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
Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.ux', uxpath);
Ext.require([
    //'Ext.grid.*',
    //'Ext.data.*',
    //'Ext.util.*',
    'Ext.ux.grid.GridHeaderFilters'//,
   // 'Ext.toolbar.Paging'
]);

Ext.onReady(function(){
    
});

function featureSourceChanged(select){
    var featureSourceId = select.value;
    var resultEl = Ext.get("featureType");
    if(featureSourceId && featureSourceId != "-1"){
        Ext.Ajax.request({
            url: featureType,
            params: {
                featureSourceId: select.value
            },
            success: function(response){
                var text = response.responseText;
                // process server response here
                var data = Ext.JSON.decode(text);
                if(data) {
                    var html="<option value=\"-1\">" + i18next.t('viewer_admin_editsolrconfig_1') + "</option>";
                    for (var id in data){
                        var ft=data[id];       
                        html+="<option value=\""+ft.id+"\"";                    
                        html+=">"+ft.name+"</option>";        
                    } 
                    resultEl.update(html);
                }
            },
            failure : function (response){
                alert(i18next.t('viewer_admin_editsolrconfig_2'));
            }
        });
    }else{
        var html = "<option value=\"-1\">" + i18next.t('viewer_admin_editsolrconfig_3') + "</option>";
        resultEl.update(html);
    }
}

function featureTypeChanged(featuretypeId){
    if(featuretypeId && featuretypeId != "-1"){
        Ext.Ajax.request({
            url: attributesUrl,
            params: {
                simpleFeatureTypeId: featuretypeId,
                solrConfiguration:configId
            },
            success: function(response){
                var text = response.responseText;
                // process server response here
                var data = Ext.JSON.decode(text);
                var resultEl = Ext.get("attributes");
                if(data) {
                    var child= resultEl.child("*");
                    if (child) {
                        child.remove();
                    }
                    var rows = data.gridrows;
                    html  = '<table class=\'formtable striped-table checkbox-table\'>';
                    html += '<tr><td>' + i18next.t('viewer_admin_editsolrconfig_4') + '</td><td>' + i18next.t('viewer_admin_editsolrconfig_5') + '</td><td>' + i18next.t('viewer_admin_editsolrconfig_6') + '</td></tr>';
                    for (var id in rows){
                        var ft=rows[id];
                        html += '<tr><td>';
                        html += '<input type="checkbox" name="indexAttributes" id="' + ft.id + '" value="' + ft.id + '"';
                        if(ft.indexChecked){
                            html += ' checked="true"';
                        }
                        html += ' />';
                        html += '</td><td>';
                        html += '<input type="checkbox" name="resultAttributes" id="' + ft.id + '" value="' + ft.id + '"';
                        if(ft.resultChecked){
                            html += ' checked="true"';
                        }
                        html += ' />';
                        html += '<td>' +  ft.attribute + '</td>';
                        html += '</td></tr>';
                    } 
                    html += '</table>';
                    Ext.create('Ext.panel.Panel', {
                        title: i18next.t('viewer_admin_editsolrconfig_0'),
                        width: '100%',
                        height: '100%',
                        bodyPadding: '0 5 5 5',
                        autoScroll: true,
                        html: html,
                        renderTo: resultEl
                    });
                }
            },
            failure : function (response){
                alert(i18next.t('viewer_admin_editsolrconfig_7'));
            }
        });
    }else{
        var html = "<option value=\"-1\">" + i18next.t('viewer_admin_editsolrconfig_8') + "</option>";
        resultEl.update(html);
    }
}