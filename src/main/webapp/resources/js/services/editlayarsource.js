Ext.onReady(function(){
    var ft = Ext.get('featuretypeSelect');    
    ft.on('change', function() {
        featureTypeChanged(ft);
    });                

    var fs = Ext.get('featureSourceSelect');
    fs.on('change', function(){
        featureSourceChanged(fs);
    });
    featureSourceChanged(fs); 
    
    // Init with change, because a certain select value can be preselected
    //featureTypeChanged(ft); 
    
});
function featureSourceChanged(el){
    var fsId = parseInt(el.getValue());
    var el = Ext.get('featuretypeSelect');  
    //var el = document.getElementById("featuretypeSelect");
    var fts=featureTypes[fsId];
    var html="<option value=\"-1\">Maak uw keuze.</option>";
    for (id in fts){
        var ft=fts[id];       
        html+="<option value=\""+ft.id+"\"";
        if (ft.id==selectedFeatureTypeId){
            html+=" selected=\"true\"";
        }
        html+=">"+ft.label+"</option>";        
    }
    el.update(html);
    featureTypeChanged(el);
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