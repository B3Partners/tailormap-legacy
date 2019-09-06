Ext.define("viewer.EditBulkFeature", {
    config: {
        actionbeanUrl: null,
        viewerController: null
    },
    constructor: function(config) {
        this.initConfig(config);
        if(this.config.actionbeanUrl == null) {
            this.config.actionbeanUrl = actionBeans["editbulkfeature"];
        }
    },
    editbulk: function(appLayer, features, successFunction, failureFunction) {
        Ext.Ajax.request({
            url: this.config.actionbeanUrl,
            params: {
                "application": this.config.viewerController.app.id,
                "appLayer": appLayer.id,
                "features": Ext.JSON.encode(features)
            },
            success: function(result) {
                var response = Ext.JSON.decode(result.responseText);

                if(response.success) {
                    if(response.hasOwnProperty("__fid")) {
                        successFunction(response.__fid);
                    } else {
                        successFunction(null);
                    }
                } else {
                    if(typeof failureFunction !== "undefined") {
                        failureFunction(response.error);
                    }
                }
            },
            failure: function(result) {
                if(typeof failureFunction !== "undefined") {
                    failureFunction("Ajax request failed with status " + result.status + " " + result.statusText + ": " + result.responseText);
                }
            }
        });
    }
});