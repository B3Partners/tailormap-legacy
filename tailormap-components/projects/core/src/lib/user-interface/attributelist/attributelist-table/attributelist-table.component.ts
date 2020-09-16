/**============================================================================
 * https://stackblitz.com/angular/voqbanbobpa?file=app%2Ftable-expandable-rows-example.ts
 *===========================================================================*/

import {Component, ElementRef, OnInit, AfterViewInit,
        Renderer2, ViewChild} from '@angular/core';

import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTable} from '@angular/material/table';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';

import {LayerService} from '../layer.service';
import {AttributeService} from '../attribute.service';
import {AttributeDataSource} from '../attributelist-datasource';
import {AttributelistTableOptionsFormComponent} from '../attributelist-table-options-form/attributelist-table-options-form.component';
import {IAttributeListColumn} from '../attributelist-column-controller';
import {PassportService} from '../passport.service';

@Component({
  selector: 'tailormap-attributelist-table',
  templateUrl: './attributelist-table.component.html',
  styleUrls: ['./attributelist-table.component.css']
})
export class AttributelistTableComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Get the paginator element.
  @ViewChild(MatPaginator, { static: true, read: ElementRef }) paginatorElem: ElementRef<HTMLDivElement>;

  // Table reference for 'manually' rendering.
  @ViewChild('table') table: MatTable<any>;

  // The table datasource.
  dataSource = new AttributeDataSource(this.dataService, this.passportService);

  // State of checked rows ("All","None","Some").
  checkState = "None";

  // Number of checked rows.
  nrChecked = 0;

  private tabIndex = -1;

  private defaultPageSize = 3;

  /**----------------------------------------------------------------------------
   * Remark: The Renderer2 is needed for setting a custom css style.
   */
  constructor(private dataService: AttributeService,
              private layerService: LayerService,
              private passportService: PassportService,
              private dialog: MatDialog,
              private renderer: Renderer2) {
    console.log("=============================");
    console.log("#Table - constructor");
  }
  /**----------------------------------------------------------------------------
   */
  ngOnInit(): void {
    console.log("#Table - ngOnInit");

    // Set custom css style (of paginator).
    this.setCustomStyle();
  }
  /**----------------------------------------------------------------------------
   */
  ngAfterViewInit(): void {
    console.log("#Table - ngAfterViewInit");

    // Set datasource paginator.
    this.dataSource.paginator = this.paginator;
    // Set datasource sort.
    this.dataSource.sorter = this.sort;

    // Hide the paginator pagesize combo.
    this.paginator.hidePageSize = true;

    // Init the paginator with the startup page index and page size.
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = this.defaultPageSize;
  }
  /**----------------------------------------------------------------------------
   */
  getColumns(includeSpecial: boolean): IAttributeListColumn[] {
    return this.dataSource.columnController.getActiveColumns(includeSpecial);
  }
  /**----------------------------------------------------------------------------
   */
  getColumnNames(): string[] {
    return this.dataSource.columnController.getActiveColumnNames(true);
  }
  /**----------------------------------------------------------------------------
   */
  onAfterLoadData(): void {

    console.log("#Table - onAfterLoadData");

    // Update the table rows.
    this.table.renderRows();

    // FOR TESTING. SHOW TABLE OPTIONS FORM AT STARTUP.
    //this.onTableOptionsClick(null);
  }
  /**----------------------------------------------------------------------------
   * Fired when the checkbox in the header is clicked.
   */
  onHeaderCheckClick(): void {
    const currCheckState = this.checkState;
    if (currCheckState === "All") {
      this.dataSource.checkNone();
    } else if (currCheckState === "None") {
      this.dataSource.checkAll();
    } else {
      this.dataSource.checkAll();
    }
    // Update check info.
    this.updateCheckedInfo();
  }
  /**----------------------------------------------------------------------------
   */
  onObjectOptionsClick(): void {
    alert("Not yet implemented.");
  }
  /**----------------------------------------------------------------------------
   */
  onPageChange(event): void {
    console.log("#Table - onPageChange");
    // Update the table.
    this.updateTable();
  }
  /**----------------------------------------------------------------------------
   * Fired when a checkbox is clicked.
   */
  onRowCheckClick(index: number): void {
    // Toggle the checkbox in the checked row.
    this.dataSource.toggleChecked(index);
    // Update check info.
    this.updateCheckedInfo();
  }
  /**----------------------------------------------------------------------------
   * Fired when a row is clicked.
   */
  onRowClicked(row: any): void {
    console.log("Checked: " + row._selected.toString());
  }
  /**----------------------------------------------------------------------------
   * Fired when a column header is clicked.
   */
  onSortClick(sort: Sort): void {
    //console.log(`Table.onSort: ${sort.active} ${sort.direction}`);

    // Reset the paginator page index.
    this.paginator.pageIndex = 0;
    // Update the table.
    this.updateTable();
  }
  /**----------------------------------------------------------------------------
   */
  onTableOptionsClick(evt: MouseEvent): void {

    // Get the target for setting the dialog position.
    let target = null;
    if (evt !== null) {
      target = new ElementRef(evt.currentTarget);
    }

    // Create and set the dialog config.
    const config = new MatDialogConfig();

    // Show transparent backdrop, click outside dialog for closing.
    config.backdropClass = "cdk-overlay-backdrop";

    // Possible additional settings:
    //     config.hasBackdrop = false;     // Don't show a gray mask.
    //     config.maxHeight = "100px";
    //     config.height = "300px";
    //     config.panelClass = 'attributelist-table-options-form';

    config.data = {
      trigger: target,
      columnController: this.dataSource.columnController
    };
    const dialogRef = this.dialog.open(AttributelistTableOptionsFormComponent, config);
    dialogRef.afterClosed().subscribe(value => {
    });
  }
  /**----------------------------------------------------------------------------
   */
  onTest(): void {
    console.log("#Table.onTest");
    this.table.renderRows();
  }
  /**----------------------------------------------------------------------------
   * Sets custom css style for elements which style cannot been set in the css file.
   */
  setCustomStyle(): void {
    // Get Paginator element.
    const parentElem = this.paginatorElem.nativeElement;
    // Get Paginator range label elements.
    const elems = parentElem.getElementsByClassName("mat-paginator-range-label");
    if (elems.length > 0) {
      // Adjust (right) margin.
      this.renderer.setStyle(elems[0], 'margin', '0px 0px 0px 0px');
    }
  }
  /**----------------------------------------------------------------------------
   */
  setTabIndex(index: number): void {
    console.log("#Table - setTabIndex");
    // Set index.
    this.tabIndex = index;
    // Get layer name.
    const layerName = this.layerService.getLayerName(this.tabIndex);
    if (layerName === "") {
      return;
    }
    // Set params layer name.
    this.dataSource.params.tableName = layerName;
    // Update table.
    this.updateTable();
  }
  /**----------------------------------------------------------------------------
   */
  updateCheckedInfo(): void {
    // Update the number checked.
    this.nrChecked = this.dataSource.getNrChecked();
    // Update the check state.
    this.checkState = this.dataSource.getCheckState(this.nrChecked);
  }
  /**----------------------------------------------------------------------------
   */
  updateTable(): void {
    // (Re)load data. Fires the onAfterLoadData method.
    this.dataSource.loadData(this);
    // TODO: Gaat dit altijd goed ivm. observable/async?
    // TODO: Dus verplaatsen naar onAfterLoadData?
    // Update check info (number checked/check state).
    this.updateCheckedInfo();
  }
}
