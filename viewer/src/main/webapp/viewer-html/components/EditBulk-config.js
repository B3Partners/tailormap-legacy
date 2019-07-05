Ext.define("viewer.components.CustomConfiguration", {
    extend: "viewer.components.SelectionWindowConfig",
    constructor: function (parentId, configObject, configPage) {
        if (configObject === null) {
            configObject = {};
        }
        configObject.showLabelconfig = true;
        viewer.components.CustomConfiguration.superclass.constructor.call(this, parentId, configObject, configPage);
        this.createCheckBoxes(this.configObject.layers, {editable: true});
        var hidden = {};
        if(this.configPage._metadata.hidden){
            hidden = this.configPage._metadata.hidden;
        }
        this.form.add([
            {
                xtype: 'numberfield',
                fieldLabel: i18next.t('edit_config_0'),
                name: 'clickRadius',
                value: this.configObject.clickRadius !== undefined ? this.configObject.clickRadius : 4,
                labelWidth: this.labelWidth,
                style: {
                    marginRight: "70px"
                }
            },
            {
                xtype: 'checkbox',
                fieldLabel: i18next.t('edit_config_5'),
                name: 'showEditLinkInFeatureInfo',
                hidden: hidden.showEditLinkInFeatureInfo === "true" ? true:false,
                value: this.configObject.showEditLinkInFeatureInfo !== undefined ? this.configObject.showEditLinkInFeatureInfo : false,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'checkbox',
                fieldLabel: i18next.t('edit_config_rememberValuesInSession'),
                name: 'rememberValuesInSession',
                value: this.configObject.rememberValuesInSession !== undefined ? this.configObject.rememberValuesInSession : false,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'checkbox',
                fieldLabel: i18next.t('edit_config_showMergeButton'),
                name: 'showMergeButton',
                value: this.configObject.showMergeButton !== undefined ? this.configObject.showMergeButton : false,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'checkbox',
                fieldLabel: i18next.t('edit_config_showSplitButton'),
                name: 'showSplitButton',
                value: this.configObject.showSplitButton !== undefined ? this.configObject.showSplitButton : false,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'checkbox',
                fieldLabel: i18next.t('edit_config_showSnappingButton'),
                name: 'showSnappingButton',
                value: this.configObject.showSnappingButton !== undefined ? this.configObject.showSnappingButton : false,
                labelWidth: this.labelWidth
            },
            {
                xtype: 'textarea',
                fieldLabel: i18next.t('edit_config_6'),
                name: 'editHelpText',
                value: this.configObject.hasOwnProperty("editHelpText") ? this.configObject.editHelpText : "",
                labelWidth: this.labelWidth,
                grow: true,
                width: 700
            }
        ]);
    },
    getDefaultValues: function() {
        return {
            details: {
                minWidth: 400,
                minHeight: 250
            }
        };
    }
});
