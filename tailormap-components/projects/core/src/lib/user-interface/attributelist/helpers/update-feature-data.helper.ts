import { Action } from '@ngrx/store';
import { updatePage, updateSort } from '../state/attribute-list.actions';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';

export class UpdateFeatureDataHelper {

  private static isUpdatePageAction(action: Action): action is ReturnType<typeof updatePage> {
    return action.type === updatePage.type;
  }

  private static isUpdateSortAction(action: Action): action is ReturnType<typeof updateSort> {
    return action.type === updateSort.type;
  }

  public static updateDataForAction(action: Action, data: AttributeListFeatureTypeData): AttributeListFeatureTypeData {
    if (UpdateFeatureDataHelper.isUpdatePageAction(action)) {
      return {
        ...data,
        pageIndex: action.page,
      };
    }
    if (UpdateFeatureDataHelper.isUpdateSortAction(action)) {
      return {
        ...data,
        sortedColumn: action.direction !== '' ? action.column : '',
        sortDirection: action.direction === 'desc' ? 'DESC' : 'ASC',
      };
    }
  }

}
