Ext.define('viewer.components.SelectedFeatures', {
    changedValues: null,
    featureItems: null,
    mapComponent: null,
    attributeNames: null,
    constructor: function (mapComponent, attributeNames) {
        this.changedValues = {};
        this.featureItems = [];
        this.mapComponent = mapComponent;
        this.attributeNames = attributeNames;
    },
    select: function (feature, clickCoord) {
        if (!this.isSelected(feature)) {
            var item = {
                id: this.getFeatureId(feature),
                feature: feature,
                clickCoord: clickCoord
            };
            this.featureItems.push(item);
            this.showMarker(feature);
        }
    },
    deselect: function (feature) {
        if (this.isSelected(feature)) {
            this.featureItems.splice(this.getIndex(feature), 1);
            this.hideMarker(feature);

            if (this.zeroSelected()) {
                this.changedValues = {};
            }
        }
    },
    deselectAll: function () {
        var featureItemsCopy = this.featureItems.map(function (item) { return item; });
        for (var i = 0; i < featureItemsCopy.length; i++) {
            this.deselect(featureItemsCopy[i].feature);
        }
    },
    changeValue: function (attributeName, newValue) {
        this.changedValues[attributeName] = newValue;
    },
    isSelected: function (feature) {
        return -1 !== this.getIndex(feature);
    },
    numSelected: function () {
        return this.featureItems.length;
    },
    zeroSelected: function () {
        return 0 === this.numSelected();
    },
    showMarker: function (feature) {
        var markerId = this.getMarkerId(feature);
        var item = this.getItemForFeature(feature);
        this.mapComponent.setMarker(markerId, item.clickCoord.x, item.clickCoord.y, 'default');
    },
    hideMarker: function (feature) {
        var markerId = this.getMarkerId(feature);
        this.mapComponent.removeMarker(markerId);
    },
    getSelectedFeatures: function () {
        var me = this;
        return this.featureItems.map(function (item) {
            return me.shallowCloneObject(item.feature);
        });
    },
    shallowCloneObject: function (original) {
        var me = this;
        var clone = {};
        Object.keys(original).forEach(function (key) {
            if (me.thisValueCannotBeCloned(original[key])) {
                clone[key] = original[key];
            } else {
                clone[key] = JSON.parse(JSON.stringify(original[key]));
            }
        });
        return clone;
    },
    thisValueCannotBeCloned: function (value) {
        return value instanceof Object === true ||
            typeof value === 'undefined' ||
            value === null;
    },
    getSelectedFeaturesWithChangesApplied: function () {
        var me = this;
        return this.getSelectedFeatures().map(function (feature) {
            return me.applyChangesToFeature(feature);
        });
    },
    applyChangesToFeature: function (feature) {
        var me = this;
        this.getChangedAttributeNames().forEach(function (attributeName) {
            feature[attributeName] = me.changedValues[attributeName];
        });
        return feature;
    },
    getChangedAttributeNames: function () {
        return Object.keys(this.changedValues);
    },
    getCombinedAttributeValues: function () {
        var me = this;
        var allCombinations = {};
        this.getAllAttributeNames().forEach(function (attributeName) {
            allCombinations[attributeName] = me.getScalarRepresentationForAttribute(attributeName);
        });
        return allCombinations;
    },
    getAllAttributeNames: function() {
        return (this.attributeNames) ? this.attributeNames : this.getAllAttributeNamesFromFirstFeature();
    },
    getAllAttributeNamesFromFirstFeature: function () {
        return (this.zeroSelected()) ? undefined : Object.keys(this.featureItems[0].feature);
    },
    getScalarRepresentationForAttribute: function (attributeName) {
        var values = this.getCombinedValuesForAllSelectedFeatures(attributeName);
        return (values.length === 1) ? values[0] : this.MULTIPLE_VALUES;
    },
    getCombinedValuesForAllSelectedFeatures: function (attributeName) {
        var values = [];
        var features = this.getSelectedFeatures();
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            var value = feature[attributeName];
            values.push(value);
        }
        return Ext.Array.unique(values);
    },
    getIndex: function (feature) {
        return this.getFeatureIds().indexOf(this.getFeatureId(feature));
    },
    getFeatureIds: function () {
        var me = this;
        return this.featureItems.map(function (item) {
            return me.getFeatureId(item.feature);
        });
    },
    getFeatureId: function (feature) {
        return feature.__fid;
    },
    getItemForFeature: function (feature) {
        if (this.isSelected(feature)) {
            return this.featureItems[this.getIndex(feature)];
        } else {
            return undefined;
        }
    },
    getMarkerId: function (feature) {
        return 'selected-feature-marker-' + this.getFeatureId(feature);
    },
    MULTIPLE_VALUES: function () {
    }
});
