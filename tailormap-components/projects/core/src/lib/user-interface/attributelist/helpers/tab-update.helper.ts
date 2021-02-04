import { Action } from '@ngrx/store';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { updatePage, updateSort } from '../state/attribute-list.actions';

export class TabUpdateHelper {

  private static isUpdatePageAction(action: Action): action is ReturnType<typeof updatePage> {
    return action.type === updatePage.type;
  }

  private static isUpdateSortAction(action: Action): action is ReturnType<typeof updateSort> {
    return action.type === updateSort.type;
  }

  public static updateTabForAction(action: Action, tab: AttributeListTabModel): AttributeListTabModel {
    if (TabUpdateHelper.isUpdatePageAction(action)) {
      return {
        ...tab,
        pageIndex: action.page,
      };
    }
    if (TabUpdateHelper.isUpdateSortAction(action)) {
      return {
        ...tab,
        sortedColumn: action.direction !== '' ? action.column : '',
        sortDirection: action.direction === 'desc' ? 'DESC' : 'ASC',
      };
    }
  }

}
