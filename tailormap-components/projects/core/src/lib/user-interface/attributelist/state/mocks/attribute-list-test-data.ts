import { AttributeListTabModel } from '../../models/attribute-list-tab.model';
import { AttributeListManagerService } from '../../services/attribute-list-manager.service';
import { AttributeListFeatureTypeData } from '../../models/attribute-list-feature-type-data.model';
import { LoadDataResult } from '../../services/attribute-list-data.service';
import { AttributeListRowModel } from '../../models/attribute-list-row.model';

export const createDummyAttributeListTab = (
  overrides?: Partial<AttributeListTabModel>,
): AttributeListTabModel => ({
  ...AttributeListManagerService.EMPTY_ATTRIBUTE_LIST_TAB,
  ...(overrides || {}),
});

export const createDummyAttributeListFeatureTypeData = (
  overrides?: Partial<AttributeListFeatureTypeData>,
): AttributeListFeatureTypeData => ({
  ...AttributeListManagerService.EMPTY_FEATURE_TYPE_DATA,
  ...(overrides || {}),
});

export const createDummyLoadResult = (
  overrides?: Partial<LoadDataResult>,
): LoadDataResult => ({
  layerId: '123',
  featureType: 12,
  totalCount: 0,
  rows: [],
  relatedFeatures: [],
  ...(overrides || {}),
});

export const createDummyRow = (
  overrides?: Partial<AttributeListRowModel>,
): AttributeListRowModel => ({
  rowId: '1',
  __fid: '1',
  related_featuretypes: [],
  _selected: false,
  _checked: false,
  _expanded: false,
  ...(overrides || {}),
});

export const createDummyRows = (
  count: number,
  rowOverride?: (index: number) => Partial<AttributeListRowModel>,
): AttributeListRowModel[] => {
  const rows: AttributeListRowModel[] = [];
  for (let i = 0; i < count; i++) {
    const override: Partial<AttributeListRowModel> = {
      rowId: `row-${i}`,
      __fid: `row-${i}`,
      ...(rowOverride ? rowOverride(i) : {}),
    };
    rows.push(createDummyRow(override));
  }
  return rows;
};

