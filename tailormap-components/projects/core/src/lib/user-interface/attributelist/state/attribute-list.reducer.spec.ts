import { AttributeListState, initialAttributeListState } from './attribute-list.state';
import * as AttributeListActions from './attribute-list.actions';
import { attributeListReducer } from './attribute-list.reducer';
import {
  createDummyAttributeListFeatureTypeData, createDummyAttributeListTab, createDummyLoadResult, createDummyRows,
} from './mocks/attribute-list-test-data';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';

let initialState: AttributeListState;
let initialStateWithTabs: AttributeListState;
let dummyTab: AttributeListTabModel;
let dummyFeatureData: AttributeListFeatureTypeData;
const TEST_LAYER_ID = '123';

describe('AttributeListReducer', () => {

  beforeEach(() => {
    initialState = { ...initialAttributeListState };
    dummyTab = createDummyAttributeListTab({ layerId: TEST_LAYER_ID });
    dummyFeatureData = createDummyAttributeListFeatureTypeData({ layerId: TEST_LAYER_ID, featureType: 12 });
    initialStateWithTabs = {
      ...initialAttributeListState,
      tabs: [ dummyTab ],
    };
  });

  it ('Handles AttributeListActions.setAttributeListVisibility', () => {
    const action = AttributeListActions.setAttributeListVisibility({ visible: true });
    expect(initialState.visible).toEqual(false);
    const updatedState = attributeListReducer(initialState, action);
    expect(updatedState.visible).toEqual(true);
  });

  it ('Handles AttributeListActions.setAttributeListConfig', () => {
    const action = AttributeListActions.setAttributeListConfig({ config: { pageSize: 20, zoomToBuffer: 21 } });
    expect(initialState.config.pageSize).toEqual(10);
    expect(initialState.config.zoomToBuffer).toEqual(10);
    const updatedState = attributeListReducer(initialState, action);
    expect(updatedState.config.pageSize).toEqual(20);
    expect(updatedState.config.zoomToBuffer).toEqual(21);
  });

  it ('Handles AttributeListActions.changeAttributeListTabs', () => {
    const tabs = [
      createDummyAttributeListTab({ layerId: '1', featureType: 12, layerName: 'Test' }),
      createDummyAttributeListTab({ layerId: '2', featureType: 24, layerName: 'Test 2' }),
    ];
    const featureData = [
      createDummyAttributeListFeatureTypeData({ layerId: '1', featureType: 12 }),
      createDummyAttributeListFeatureTypeData({ layerId: '2', featureType: 24 }),
    ];
    const action = AttributeListActions.changeAttributeListTabs({
      closedTabs: [ '1', '2', '3' ],
      newTabs: tabs,
      newFeatureData: featureData,
    });
    expect(initialState.tabs.length).toEqual(0);
    expect(initialState.featureTypeData.length).toEqual(0);
    const updatedState = attributeListReducer(initialState, action);
    expect(updatedState.tabs.length).toEqual(2);
    expect(updatedState.featureTypeData.length).toEqual(2);
    const action2 = AttributeListActions.changeAttributeListTabs({ closedTabs: [ '1' ], newTabs: [], newFeatureData: [] });
    const updatedState2 = attributeListReducer(updatedState, action2);
    expect(updatedState2.tabs.length).toEqual(1);
    expect(updatedState2.featureTypeData.length).toEqual(1);
    expect(updatedState2.tabs[0].layerName).toEqual('Test 2');
  });

  it ('Handles AttributeListActions.setSelectedTab', () => {
    const action = AttributeListActions.setSelectedTab({ layerId: TEST_LAYER_ID });
    expect(initialState.selectedTabLayerId).toEqual(null);
    const updatedState = attributeListReducer(initialState, action);
    expect(updatedState.selectedTabLayerId).toEqual(TEST_LAYER_ID);
  });

  it ('Handles AttributeListActions.loadDataForTab', () => {
    const action = AttributeListActions.loadDataForTab({ layerId: TEST_LAYER_ID });
    expect(initialState.tabs.length).toEqual(0);
    const updatedState = attributeListReducer(initialState, action);
    expect(updatedState.tabs.length).toEqual(0);

    expect(initialStateWithTabs.tabs[0].loadingData).toEqual(false);
    const updatedState2 = attributeListReducer(initialStateWithTabs, action);
    expect(updatedState2.tabs.length).toEqual(1);
    expect(updatedState2.tabs[0].loadingData).toEqual(true);
  });

  it ('Handles AttributeListActions.loadDataForTabSuccess', () => {
    const state: AttributeListState = { ...initialState, tabs: [{ ...dummyTab, loadingData: true }], featureTypeData: [ dummyFeatureData ]};
    const loadResult = createDummyLoadResult({
      rows: createDummyRows(10),
      featureType: dummyFeatureData.featureType,
      layerId: dummyFeatureData.layerId,
      totalCount: 100,
    });
    const action = AttributeListActions.loadDataForTabSuccess({ layerId: TEST_LAYER_ID, data: loadResult });
    const updatedState = attributeListReducer(state, action);
    expect(updatedState.tabs.length).toEqual(1);
    expect(updatedState.tabs[0].loadingData).toEqual(false);
    expect(updatedState.featureTypeData.length).toEqual(1);
    expect(updatedState.featureTypeData[0].rows.length).toEqual(10);
    expect(updatedState.featureTypeData[0].totalCount).toEqual(100);
  });

  it ('Handles AttributeListActions.loadDataForFeatureTypeSuccess', () => {
    const state: AttributeListState = { ...initialState, tabs: [ dummyTab ], featureTypeData: [ dummyFeatureData ]};
    const loadResult = createDummyLoadResult({
      rows: createDummyRows(20),
      featureType: dummyFeatureData.featureType,
      layerId: dummyFeatureData.layerId,
      totalCount: 200,
    });
    const action = AttributeListActions.loadDataForFeatureTypeSuccess({ layerId: dummyFeatureData.layerId, featureType: dummyFeatureData.featureType, data: loadResult });
    const updatedState = attributeListReducer(state, action);
    expect(updatedState.tabs.length).toEqual(1);
    expect(updatedState.featureTypeData.length).toEqual(1);
    expect(updatedState.featureTypeData[0].rows.length).toEqual(20);
    expect(updatedState.featureTypeData[0].totalCount).toEqual(200);
  });

  it ('Handles AttributeListActions.loadTotalCountForTabSuccess', () => {
    const state: AttributeListState = { ...initialState, tabs: [ dummyTab ], featureTypeData: [ { ...dummyFeatureData, totalCount: 150 } ]};
    const action = AttributeListActions.loadTotalCountForTabSuccess({
      layerId: dummyFeatureData.layerId,
      counts: [ { featureType: dummyFeatureData.featureType, totalCount: 100 } ],
    });
    const updatedState = attributeListReducer(state, action);
    expect(updatedState.tabs.length).toEqual(1);
    expect(updatedState.featureTypeData.length).toEqual(1);
    expect(updatedState.featureTypeData[0].totalCount).toEqual(100);

    const action2 = AttributeListActions.loadTotalCountForTabSuccess({
      layerId: dummyFeatureData.layerId,
      counts: [ { featureType: dummyFeatureData.featureType, totalCount: 0 }, { featureType: 1234546, totalCount: 1000000 } ],
    });
    const updatedState2 = attributeListReducer(updatedState, action2);
    expect(updatedState2.tabs.length).toEqual(1);
    expect(updatedState2.featureTypeData.length).toEqual(1);
    expect(updatedState2.featureTypeData[0].totalCount).toEqual(0);
  });

  it ('Handles AttributeListActions.updateRowChecked', () => {
    const featureData: AttributeListFeatureTypeData = {
      ...dummyFeatureData,
      rows: createDummyRows(10, rowId => ({ featureId: `feature-${rowId}` })),
      attributeRelationKeys: [ 'featureId' ],
    };
    const state: AttributeListState = { ...initialState, tabs: [ dummyTab ], featureTypeData: [ featureData ]};
    const createUpdateRowCheckedAction = (rowId: string, checked: boolean) => AttributeListActions.updateRowChecked({
      layerId: dummyFeatureData.layerId,
      rowId,
      featureType: featureData.featureType,
      checked,
    });

    const action = createUpdateRowCheckedAction('row-5', true);
    const updatedState = attributeListReducer(state, action);
    expect(updatedState.featureTypeData[0].checkedFeatures).toEqual([{ rowId: 'row-5', featureId: 'feature-5' }]);

    const action2 = createUpdateRowCheckedAction('row-6', true);
    const updatedState2 = attributeListReducer(updatedState, action2);
    expect(updatedState2.featureTypeData[0].checkedFeatures).toEqual([{ rowId: 'row-6', featureId: 'feature-6' }, { rowId: 'row-5', featureId: 'feature-5' }]);

    const action3 = createUpdateRowCheckedAction('row-5', false);
    const updatedState3 = attributeListReducer(updatedState2, action3);
    expect(updatedState3.featureTypeData[0].checkedFeatures).toEqual([{ rowId: 'row-6', featureId: 'feature-6' }]);
  });

});
