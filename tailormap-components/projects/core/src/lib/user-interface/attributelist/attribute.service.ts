/**============================================================================
 *===========================================================================*/

import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AttributeParams} from './attribute-params';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {

  /**----------------------------------------------------------------------------
   */
  constructor(private http: HttpClient) {
  }
  /**----------------------------------------------------------------------------
   */
  private getUrl(tableName: string): string {
    //const url = `assets/json/${tableName.toLowerCase()}-attributes.json`;
    const url = `http://localhost:3200/assets/json/${tableName.toLowerCase()}-attributes.json`;
    return url;
  }
  /**----------------------------------------------------------------------------
   */
  public loadData(params: AttributeParams): Observable<any[]> {
    console.log("#Service - loadData: " + params.tableName);
    const url = this.getUrl(params.tableName);
    return this.http.get<any[]>(url);
  }
}
