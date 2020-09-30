/**
 * For changing the paginator labels.
 *
 * Remarks: After clicking the 'next' button the itemsPerPageLabel will
 *          disappear.
 */

import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable({
  providedIn: 'root',
})
export class PaginatorLabels extends MatPaginatorIntl {

  public itemsPerPageLabel = 'items per pagina: ';
  public previousPageLabel = 'vorige';
  public nextPageLabel = 'volgende';
  public firstPageLabel = 'begin';
  public lastPageLabel = 'eind';

  // tslint:disable-next-line:only-arrow-functions
  public getRangeLabel = function(page, pageSize, length) {
    if (length === 0 || pageSize === 0) {
      return '0 van ' + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try
    // and fix the end index to the end.
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return startIndex + 1 + ' - ' + endIndex + ' van ' + length;
  };

  constructor() {
    super();
  }
}
