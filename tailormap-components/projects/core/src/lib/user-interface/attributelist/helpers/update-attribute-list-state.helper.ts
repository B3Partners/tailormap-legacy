import { Action } from '@ngrx/store';
import { setSelectedFeatureType, updatePage, updateSort } from '../state/attribute-list.actions';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';

export class UpdateAttributeListStateHelper {

  private static isUpdatePageAction(action: Action): action is ReturnType<typeof updatePage> {
    return action.type === updatePage.type;
  }

  private static isUpdateSortAction(action: Action): action is ReturnType<typeof updateSort> {
    return action.type === updateSort.type;
  }

  private static isSetSelectedFeatureTypeAction(action: Action): action is ReturnType<typeof setSelectedFeatureType> {
    return action.type === setSelectedFeatureType.type;
  }

  public static updateDataForAction(action: Action, data: AttributeListFeatureTypeData): AttributeListFeatureTypeData {
    if (UpdateAttributeListStateHelper.isUpdatePageAction(action)) {
      return {
        ...data,
        pageIndex: action.page,
      };
    }
    if (UpdateAttributeListStateHelper.isUpdateSortAction(action)) {
      return {
        ...data,
        sortedColumn: action.direction !== '' ? action.column : '',
        sortDirection: action.direction === 'desc' ? 'DESC' : 'ASC',
      };
    }
    return data;
  }

  public static updateTabForAction(action: Action, tab: AttributeListTabModel): AttributeListTabModel {
    if (UpdateAttributeListStateHelper.isSetSelectedFeatureTypeAction(action)) {
      return {
        ...tab,
        selectedRelatedFeatureType: action.featureType,
      };
    }
    return tab;
  }

}
