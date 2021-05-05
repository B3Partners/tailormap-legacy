import { RelatedFilterDataModel } from '../models/related-filter-data.model';
import { RelatedFilterHelper } from './related-filter.helper';

const dataTree: RelatedFilterDataModel[] = [
  { featureType: 1, filter: 'FILTER_1' },
  { featureType: 2, parentFeatureType: 1 },
  { featureType: 3, parentFeatureType: 2, filter: 'FILTER_1_2_3' },
  { featureType: 4, parentFeatureType: 2 },
  { featureType: 5, parentFeatureType: 1, filter: 'FILTER_1_5' },
  { featureType: 6, parentFeatureType: 1 },
  { featureType: 7, parentFeatureType: 6 },
  { featureType: 8, parentFeatureType: 6 },
  { featureType: 9, parentFeatureType: 8, filter: 'FILTER_1_6_8_9' },
];

describe('RelatedFilterHelper', () => {

  it('creates filter for top parent', () => {
    const data = [...dataTree];
    const result = RelatedFilterHelper.getFilter(1, data);
    expect(result.length).toEqual(4);
    expect(result).toEqual([
      'FILTER_1',
      'RELATED_FEATURE(1, 2, (RELATED_FEATURE(2, 3, (FILTER_1_2_3))))',
      'RELATED_FEATURE(1, 5, (FILTER_1_5))',
      'RELATED_FEATURE(1, 6, (RELATED_FEATURE(6, 8, (RELATED_FEATURE(8, 9, (FILTER_1_6_8_9))))))',
    ]);
  });

  it('creates filter for feature in middle of tree', () => {
    const data = [...dataTree];
    const result = RelatedFilterHelper.getFilter(2, data);
    expect(result.length).toEqual(4);
    expect(result).toEqual([
      'RELATED_FEATURE(2, 3, (FILTER_1_2_3))',
      'RELATED_FEATURE(2, 1, (FILTER_1))',
      'RELATED_FEATURE(2, 1, (RELATED_FEATURE(1, 5, (FILTER_1_5))))',
      'RELATED_FEATURE(2, 1, (RELATED_FEATURE(1, 6, (RELATED_FEATURE(6, 8, (RELATED_FEATURE(8, 9, (FILTER_1_6_8_9))))))))',
    ]);
  });

  it('creates filter for feature bottom leaf in the tree', () => {
    const data = [...dataTree];
    const result = RelatedFilterHelper.getFilter(9, data);
    expect(result.length).toEqual(4);
    expect(result).toEqual([
      'FILTER_1_6_8_9',
      'RELATED_FEATURE(9, 8, (RELATED_FEATURE(8, 6, (RELATED_FEATURE(6, 1, (FILTER_1))))))',
      'RELATED_FEATURE(9, 8, (RELATED_FEATURE(8, 6, (RELATED_FEATURE(6, 1, (RELATED_FEATURE(1, 2, (RELATED_FEATURE(2, 3, (FILTER_1_2_3))))))))))',
      'RELATED_FEATURE(9, 8, (RELATED_FEATURE(8, 6, (RELATED_FEATURE(6, 1, (RELATED_FEATURE(1, 5, (FILTER_1_5))))))))',
    ]);
  });

});
