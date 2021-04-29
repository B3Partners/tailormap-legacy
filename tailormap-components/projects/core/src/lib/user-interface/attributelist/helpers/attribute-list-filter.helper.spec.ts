import { createDummyAttributeListFeatureTypeData, createDummyAttributeListTab } from '../state/mocks/attribute-list-test-data';
import { AttributeListFilterHelper } from './attribute-list-filter.helper';

describe('AttributeListFilterHelper', () => {

  const tab = createDummyAttributeListTab({
    layerId: '123',
    featureType: 123,
  });

  const featureData = createDummyAttributeListFeatureTypeData({
    layerId: '123',
    featureType: 123,
  });

  it('creates empty filter for data without filters', () => {
    const filter = AttributeListFilterHelper.getFilter(tab, 123, [ featureData ]);
    expect(filter).toEqual('');
  });

  it('creates filter for data without filters', () => {
    const filter = AttributeListFilterHelper.getFilter(tab, 123, [ featureData ]);
    expect(filter).toEqual('');
  });

});
