Ext.onReady(function(){
    var el = Ext.get('featuretypeSelect');    
    el.on('change', function() {
        featureTypeChanged(el);
    });                

    // Init with change, because a certain select value can be preselected
    featureTypeChanged(el); 
});

function featureTypeChanged(el){
    var ftId= parseInt(el.getValue());
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