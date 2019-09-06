describe('viewer.components.SelectedFeatures', function() {
    var selectedFeatures;

    var mockMapComponent = {
        setMarker: function() {},
        removeMarker: function() {}
    };

    var mockAttributeNames = [
        '__fid',
        'attribute1',
        'attribute2'
    ];

    var mockFeature1 = {
        __fid: '1',
        'attribute1': 'equal_value',
        'attribute2': 'different_value1'
    };

    var mockFeature2 = {
        __fid: '2',
        'attribute1': 'equal_value',
        'attribute2': 'different_value2'
    };

    var mockFeature3 = {
        __fid: '3',
        'attribute1': undefined,
        'attribute2': null
    };

    var mockClickCoord1 = {
        x: 1,
        y: 1
    };

    var mockClickCoord2 = {
        x: 2,
        y: 2
    };

    beforeEach(function() {
        selectedFeatures = Ext.create('viewer.components.SelectedFeatures', mockMapComponent, mockAttributeNames);
    });

    it('can select a feature', function() {
        selectedFeatures.select(mockFeature1, mockClickCoord1);
        expect(selectedFeatures.isSelected(mockFeature1)).toBeTruthy();
    });

    it('gives correct attribute names', function() {
        selectedFeatures.select(mockFeature1, mockClickCoord1);
        var attributeNames = selectedFeatures.getAllAttributeNames();
        expect(attributeNames).toEqual(['__fid', 'attribute1', 'attribute2']);
    });

    it('can count number of selected features', function() {
        selectedFeatures.select(mockFeature1, mockClickCoord1);
        expect(selectedFeatures.numSelected()).toEqual(1);
        expect(selectedFeatures.zeroSelected()).toBeFalsy();
        selectedFeatures.deselect(mockFeature1);
        expect(selectedFeatures.numSelected()).toEqual(0);
        expect(selectedFeatures.zeroSelected()).toBeTruthy();
    });

    describe('.getCombinedAttributeValues', function() {
        it('returns multiple if there are multiple values', function () {
            selectedFeatures.select(mockFeature1, mockClickCoord1);
            selectedFeatures.select(mockFeature2, mockClickCoord2);
            var combined = selectedFeatures.getCombinedAttributeValues();
            expect(combined['attribute1']).toEqual('equal_value');
            expect(combined['attribute2']).toEqual(selectedFeatures.MULTIPLE_VALUES);
        });

        it('deals correctly with undefined and null values', function() {
            selectedFeatures.select(mockFeature3, mockClickCoord1);
            var combined = selectedFeatures.getCombinedAttributeValues();
            expect(combined['attribute1']).toBeUndefined();
            expect(combined['attribute2']).toBeNull();
        });
    });

    describe(".getSelectedFeaturesWithChangesApplied", function() {
        it('returns new value if changed', function () {
            selectedFeatures.select(mockFeature1, mockClickCoord1);
            selectedFeatures.select(mockFeature2, mockClickCoord2);

            var newValue = 'this_is_the_new_value';
            selectedFeatures.changeValue('attribute2', newValue);

            var features = selectedFeatures.getSelectedFeaturesWithChangesApplied();
            features.forEach(function (feature) {
                expect(feature['attribute2']).toEqual(newValue);
            });
        });

        it('returns original values if not changed', function () {
            selectedFeatures.select(mockFeature1, mockClickCoord1);
            selectedFeatures.select(mockFeature2, mockClickCoord2);
            var features = selectedFeatures.getSelectedFeaturesWithChangesApplied();
            expect(features[0]['attribute2']).toEqual(mockFeature1['attribute2']);
            expect(features[1]['attribute2']).toEqual(mockFeature2['attribute2']);
        });
    });
});
