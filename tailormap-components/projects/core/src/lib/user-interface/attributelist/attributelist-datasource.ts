/**============================================================================
 * Remarks:
 * - Add an extra "_checked" column to the rows.
 *===========================================================================*/

import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {DataSource} from '@angular/cdk/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';

import {AttributeParams} from './attribute-params';
import {AttributelistColumnController} from './attributelist-column-controller';
import {AttributelistTableComponent} from './attributelist-table/attributelist-table.component';
import {AttributeService} from './attribute.service';
import {PassportService} from './passport.service';

import {Utils} from './utils';

/**============================================================================
 */
export class AttributeDataSource extends DataSource<any> {

  columnController = new AttributelistColumnController();

  // The REST API params (layerName,filter,...) for retrieving the data.
  params = new AttributeParams();

  // The paginator for paging.
  paginator: MatPaginator;

  // The sorter for sorting.
  sorter: MatSort;

  // The loaded data rows (i.e. page).
  private rows: any[] = [];

  /**----------------------------------------------------------------------------
   */
  constructor(private dataService: AttributeService,
              private passportService: PassportService) {
    super();
  }
  /**----------------------------------------------------------------------------
   */
  connect(): Observable<any[]> {
    console.log("-----------------------------");
    console.log("#AttributeDataSource - connect");
    return of(this.rows);
  }
  /**----------------------------------------------------------------------------
   */
  disconnect(): void {
  }
  /**----------------------------------------------------------------------------
   */
  addRow(row: any): void {
    this.rows.push(row);
  }
  /**----------------------------------------------------------------------------
   */
  checkAll(): void {
    this.rows.forEach( (row: any) => { row._checked = true; } );
  }
  /**----------------------------------------------------------------------------
   */
  checkNone(): void {
    this.rows.forEach( (row: any) => { row._checked = false; } );
  }
  /**----------------------------------------------------------------------------
   * Returns the state of the checked rows ("All","None","Some").
   */
  getCheckState(nrChecked: number): string {
    // No checked rows?
    if (nrChecked === 0) {
      return "None";
    }
    // All rows are checked?
    if (nrChecked === this.rows.length) {
      return "All";
    } else {
      return "Some";
    }
  }
  /**----------------------------------------------------------------------------
   * Returns the number of checked rows.
   */
  getNrChecked(): number {
    let cnt = 0;
    this.rows.forEach( (row: any) => {
      if (row._checked) {
        cnt += 1;
      }
    });
    return cnt;
  }
  /**----------------------------------------------------------------------------
   */
  loadData(attrTable: AttributelistTableComponent): void {

    console.log("#AttributeDataSource - loadData - " + this.params.tableName);

    // Passport columns not yet loaded?
    if (!this.columnController.hasPassportColumns()) {
      // Get Passport column names.
      this.passportService.getColumnNames(this.params.tableName).subscribe(
        (columnNames: string[]) => {
          // And set as initial column names.
          this.columnController.setPassportColumnNames(columnNames);
        }
      );
    }

    // Remove all rows.
    this.rows.splice(0, this.rows.length);

    // Add new rows.
    this.dataService.loadData(this.params)
      .pipe(
        tap((data: any[]) => {
          console.log("#AttributeDataSource - loadData - pipe(tab)");
        }),
        // Simulate REST API server.
        map ( (data: any[]) => this.simulateApiServer(data, this.params)),
        // Add column "_checked" to all rows.
        map( (data: any[]) => Utils.rowsAddColumn(data, "_checked", false)),
        // Extract column names and set.
        tap((data: any[]) => {
          // Not filled yet?
          if (!this.columnController.hasDataColumns()) {
            // Extract column names from data.
            const columnNames = Utils.rowsGetColumnNames(data);
            // And set as initial column names.
            this.columnController.setDataColumnNames(columnNames);
          }
        })
      )
      .subscribe( (data: any[]) => {
          console.log(data[0]);
          // TODO: Kan dit sneller????
          data.forEach(d => {
            this.rows.push(d);
          });
        },
        () => {},
        () => {
          //console.log("loadData - competed");
          // Update the table.
          attrTable.onAfterLoadData();
        }
      );
  }
  /**----------------------------------------------------------------------------
   * Simulates the rest api server (sorting,paging).
   */
  private simulateApiServer(data: any[], params: AttributeParams): any[] {
    let newData: any[];
    let sortColName = this.sorter.active;

    // No sort column name specified?
    if (sortColName === "") {
      // Get colum names from rows.
      const columnNames = Utils.rowsGetColumnNames(data);
      const origColumnNames = Utils.arrayFilterColumnNames(columnNames);
      if (origColumnNames.length > 0) {
        sortColName = origColumnNames[0];
      }
    }

    // Set sort column.
    this.sorter.active = sortColName;

    // Sort column name found?
    if (sortColName !== "") {
      // Sort data.
      newData = Utils.arraySortOnColumnName(data, sortColName, this.sorter.direction);
    } else {
      // Copy the data.
      newData = [...data];
    }
    // Get page.
    newData = Utils.arrayGetPage(newData,
                                 this.paginator.pageIndex,
                                 this.paginator.pageSize);
    return newData;
  }
  /**----------------------------------------------------------------------------
   */
  replaceRows(rows: any[]): void {
    // Remove all from rows.
    this.rows.splice(0, this.rows.length);
    //console.log(this.rows.length);
    rows.forEach(r => {
      this.rows.push(r);
    });
  }
  /**----------------------------------------------------------------------------
   */
  public toggleChecked(index: number): void {
    this.rows[index]._checked = !this.rows[index]._checked;
  }
}
