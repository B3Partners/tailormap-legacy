/**============================================================================
 *===========================================================================*/

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {TestData} from './test-data';

@Injectable({
  providedIn: 'root'
})
export class PassportService {

  /**----------------------------------------------------------------------------
   */
  constructor() {
  }
  /**----------------------------------------------------------------------------
   */
  public getColumnNames(layerName: string): Observable<string[]> {
    return of(TestData.getPassport(layerName));
  }
}
