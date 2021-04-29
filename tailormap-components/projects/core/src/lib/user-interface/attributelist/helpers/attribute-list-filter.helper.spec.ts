import { createDummyAttributeListFeatureTypeData, createDummyAttributeListTab } from '../state/mocks/attribute-list-test-data';
import { AttributeListFilterHelper } from './attribute-list-filter.helper';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { AttributeTypeEnum } from '../../../shared/models/attribute-type.enum';

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

  it('creates filter for data without relations', () => {
    const featureDataWithFilter: AttributeListFeatureTypeData = {
      ...featureData,
      filter: [
        { attribute: 'city', value: ['Utrecht'], condition: 'LIKE', attributeType: AttributeTypeEnum.STRING, featureType: 123 },
      ],
    };
    const filter = AttributeListFilterHelper.getFilter(tab, 123, [ featureDataWithFilter ]);
    expect(filter).toEqual(`(city ILIKE '%Utrecht%')`);
  });

  it('creates filter for data with relations', () => {
    const mainFeatureData: AttributeListFeatureTypeData = {
      ...featureData,
      filter: [
        { attribute: 'city', value: ['Utrecht'], condition: 'LIKE', attributeType: AttributeTypeEnum.STRING, featureType: 123 },
      ],
    };
    const child1: AttributeListFeatureTypeData = createDummyAttributeListFeatureTypeData({
      layerId: '123',
      featureType: 234,
      parentFeatureType: 123,
    });
    const child2: AttributeListFeatureTypeData = createDummyAttributeListFeatureTypeData({
      layerId: '123',
      featureType: 345,
      parentFeatureType: 234,
      filter: [
        { attribute: 'amount', value: ['15'], condition: '=', attributeType: AttributeTypeEnum.NUMBER, featureType: 345 },
      ],
    });
    const filter = AttributeListFilterHelper.getFilter(tab, 345, [ mainFeatureData, child1, child2 ]);
    expect(filter).toEqual(`(amount = 15) AND RELATED_FEATURE(345, 234, (RELATED_FEATURE(234, 123, ((city ILIKE '%Utrecht%')))))`);
  });

  it('creates filter with checked rows', () => {
    const mainFeatureData: AttributeListFeatureTypeData = {
      ...featureData,
      filter: [
        { attribute: 'city', value: ['Utrecht'], condition: 'LIKE', attributeType: AttributeTypeEnum.STRING, featureType: 123 },
      ],
      checkedFeatures: [
        { rowId: '1', id: '1' },
        { rowId: '2', id: '2' },
        { rowId: '3', id: '3' },
      ],
    };
    const child1: AttributeListFeatureTypeData = createDummyAttributeListFeatureTypeData({
      layerId: '123',
      featureType: 234,
      parentFeatureType: 123,
      parentAttributeRelationKeys: [
        { parentAttribute: 'id', childAttribute: 'city_id' },
      ],
      filter: [
        { attribute: 'amount', value: ['15'], condition: '=', attributeType: AttributeTypeEnum.NUMBER, featureType: 234 },
      ],
    });
    const filter = AttributeListFilterHelper.getFilter(tab, 234, [ mainFeatureData, child1 ]);
    const expectedChildFilters = [
      `(amount = 15)`,
      `(city_id IN ('1','2','3'))`,
      `RELATED_FEATURE(234, 123, ((city ILIKE '%Utrecht%')))`,
    ];
    const mainFilter = AttributeListFilterHelper.getFilter(tab, 123, [ mainFeatureData, child1 ]);
    const expectedMainFilters = [
      `(city ILIKE '%Utrecht%')`,
      `RELATED_FEATURE(123, 234, ((amount = 15) AND (city_id IN ('1','2','3'))))`,
    ];
    expect(mainFilter).toEqual(expectedMainFilters.join(' AND '));
  });

});
