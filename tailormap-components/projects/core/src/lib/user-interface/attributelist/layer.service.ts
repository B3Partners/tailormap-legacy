/**============================================================================
 *===========================================================================*/

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ILayer } from './layer.model';
import { AttributelistTabComponent } from './attributelist-tab/attributelist-tab.component';

@Injectable({
  providedIn: 'root'
})
export class LayerService {

  // Zie angular.json.
  // "assets": [
  //   "projects/bridge/src/favicon.ico",
  //   "projects/bridge/src/assets"

  //private url = "assets/json/layers.json";
  private url = "http://localhost:3200/assets/json/layers.json";

  public rows: ILayer[];

  /**----------------------------------------------------------------------------
   */
  constructor(private http: HttpClient) {
  }
  /**----------------------------------------------------------------------------
   */
  addLayer(name: string): void {
    this.rows.push({name});
  }
  /**----------------------------------------------------------------------------
   * https://phpenthusiast.com/blog/develop-angular-php-app-getting-the-list-of-items
   */
  public getRows(): Observable<ILayer[]> {
    return this.http.get(this.url).pipe(
      map((data: any) => {
        this.rows = data;
        return this.rows;
      }),
      catchError(this.handleError)
    );
  }
  /**----------------------------------------------------------------------------
   * Returns an observable with a user friendly message.
   *
   * TODO: Waarom <never>?
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError('An error occurred while getting the layers.');
  }
  /**----------------------------------------------------------------------------
   */
  public getRowsAsArray(): ILayer[] {
    return this.rows;
  }
  /**----------------------------------------------------------------------------
   * Returns an empty string when no valid index.
   */
  public getLayerName(index: number): string {
    if ((index < 0) || (index > this.rows.length - 1)) {
      console.log("LayerService.getLayerName - No valid index.");
      return "";
    }
    return this.rows[index].name;
  }
  /**----------------------------------------------------------------------------
   */
  public getTabComponent(index: number): AttributelistTabComponent {
    if ((index < 0) || (index > this.rows.length - 1)) {
      console.log("LayerService.getTabComponent - No valid index.");
      return null;
    }
    return this.rows[index].tabComponent;
  }
  /**----------------------------------------------------------------------------
   */
  public registerTabComponent(index: number, tab: AttributelistTabComponent): void {
    if ((index < 0) || (index > this.rows.length - 1)) {
      console.log("LayerService.registerTabComponent - No valid index.");
      return;
    }
    this.rows[index].tabComponent = tab;
  }
}
