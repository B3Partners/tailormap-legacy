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

/*

featureSourceSelect
foreignFeatureSourceSelect

featuretypeSelect
foreignFeaturetypeSelect
*/
Ext.onReady(function(){
    var featureSourceSelect = Ext.get('featureSourceSelect');
    featureSourceSelect && featureSourceSelect.on('change', function() {
        attributes=[];
        featureSourceChanged(this,Ext.get('featuretypeSelect'));
    });                

    var foreignFeatureSourceSelect = Ext.get('foreignFeatureSourceSelect');
    foreignFeatureSourceSelect && foreignFeatureSourceSelect.on('change', function(){
        foreignAttributes=[];
        featureSourceChanged(this, Ext.get('foreignFeaturetypeSelect'));
    });
    
    var featuretypeSelect = Ext.get('featuretypeSelect');
    featuretypeSelect && featuretypeSelect.on('change', function(){
        attributes=[];
        featureTypeChanged(this, setAttributes);
    });
    
    var foreignFeaturetypeSelect = Ext.get('foreignFeaturetypeSelect');
    foreignFeaturetypeSelect && foreignFeaturetypeSelect.on('change', function(){
        foreignAttributes=[];
        featureTypeChanged(this, setForeignAttributes);
    });
    
    // Init with change, because a certain select value can be preselected
    //featureTypeChanged(ft);     
});

var attributes=[];
var foreignAttributes=[];

function setAttributes(att){
    attributes=att;
}
function setForeignAttributes(att){
    foreignAttributes=att;
}

function featureSourceChanged(el,resultEl){
    var fsId = parseInt(el.getValue());
    var el = Ext.get('featuretypeSelect');  
    if (fsId < 0 ){
        return;
    }
    clearAttributeBoxes();
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
function featureTypeChanged(el,setAttFunction){
    var ftId= parseInt(el.getValue());
    if (ftId < 0 ){
        return;
    }
    clearAttributeBoxes();
    Ext.Ajax.request({
        url: attributesUrl,
        params: {featureTypeId: ftId},
        success: function(result){
            var response = Ext.JSON.decode(result.responseText);
            if(response.success) {
                setAttFunction.call(this,response.attributes);
                addAttributeBoxes();
            } else {
                alert(response.error);
            }
        },
        failure: function(result){            
            failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);            
        }
    });
}

var attributeBoxes=[];
function addAttributeBoxes(leftValue,rightValue){
    if (attributes.length > 0 && foreignAttributes.length > 0){
        //left box
        var leftEl=document.createElement("select");
        leftEl.id="leftSide_"+(attributeBoxes.length/2);
        leftEl.name="leftSide["+(attributeBoxes.length/2)+"]";
        var leftBox = new Ext.Element(leftEl);
        leftBox.addCls("relation_left_side");
        var html="<option value=\"-1\">Maak uw keuze.</option>";
        for (var id in attributes){
            var at=attributes[id];       
            html+="<option value=\""+at.id+"\"";
            if (leftValue==at.id){
                html+=" selected=\"selected\"";                
            }
            html+=">"+at.name+"</option>";        
        }        
        leftBox.update(html);
        
        //right box
        var rightEl=document.createElement("select");
        rightEl.id="rightSide_"+(attributeBoxes.length/2);
        rightEl.name="rightSide["+(attributeBoxes.length/2)+"]";
        var rightBox = new Ext.Element(rightEl);
        rightBox.addCls("relation_right_side");
        var html="<option value=\"-1\">Maak uw keuze.</option>";
        for (var id in foreignAttributes){
            var at=foreignAttributes[id];       
            html+="<option value=\""+at.id+"\"";   
            if (rightValue==at.id){
                html+=" selected=\"selected\"";                
            }
            html+=">"+at.name+"</option>";        
        }
        rightBox.update(html);
        
        attributeBoxes.push(leftBox);
        attributeBoxes.push(rightBox);
        
        var container=Ext.get("attributeContainer");
        container.insertHtml('beforeEnd','- ');
        container.appendChild(leftBox);        
        container.insertHtml('beforeEnd',' = ');
        container.appendChild(rightBox);        
        container.insertHtml('beforeEnd','<br>');
    }
}
function clearAttributeBoxes(){
    var container=Ext.get("attributeContainer");
    container.update("");
}