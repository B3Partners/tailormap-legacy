
import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { AttributelistTable, RowClickData, RowData } from '../attributelist-common/attributelist-models';
import { AttributeDataSource } from '../attributelist-common/attributelist-datasource';
import { AttributelistFilter } from '../attributelist-common/attributelist-filter';
import { AttributelistFilterValuesFormComponent } from '../attributelist-filter-values-form/attributelist-filter-values-form.component';
import { AttributelistColumn } from '../attributelist-common/attributelist-column-models';
import { AttributelistTableOptionsFormComponent } from '../attributelist-table-options-form/attributelist-table-options-form.component';
import { AttributelistService } from '../attributelist.service';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { CheckState } from '../attributelist-common/attributelist-enums';
import {
  FilterColumns,
  FilterValueSettings,
} from '../attributelist-common/attributelist-filter-models';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { LayerService } from '../layer.service';
import { ValueService } from '../../../shared/value-service/value.service';
import {
  ValueParameters,
  UniqueValuesResponse,
} from '../../../shared/value-service/value-models';

@Component({
  selector: 'tailormap-attributelist-table',
  templateUrl: './attributelist-table.component.html',
  styleUrls: ['./attributelist-table.component.css'],
  animations: [
    trigger('onDetailsExpand', [
      state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AttributelistTableComponent implements AttributelistTable, OnInit, AfterViewInit {

  @ViewChild(MatPaginator) private paginator: MatPaginator;
  @ViewChild(MatSort) private sort: MatSort;

  // Table reference for 'manually' rendering.
  @ViewChild('table') public table: MatTable<any>;

  @Output()
  public pageChange = new EventEmitter();

  @Output()
  public rowClick = new EventEmitter<RowClickData>();

  @Output()
  public tabChange = new EventEmitter();

  public dataSource = new AttributeDataSource(this.layerService,
                                              this.attributeService,
                                              this.formconfigRepoService);

  public filter = new AttributelistFilter();

  // Number of checked rows.
  public nrChecked = 0;

  // State of checked rows ('All','None','Some').
  public checkState = CheckState.None;

  private tabIndex = -1;

  private valueParams: ValueParameters = {
    applicationLayer: 0,
    attributes: [],
  }

  constructor(private attributeService: AttributeService,
              private layerService: LayerService,
              private valueService: ValueService,
              public attributelistService: AttributelistService,
              private formconfigRepoService: FormconfigRepositoryService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {
    // console.log('=============================');
    // console.log('#Table - constructor');
  }

  public ngOnInit(): void {
  }

  public ngAfterViewInit(): void {
    // console.log('#Table - ngAfterViewInit');

    // Set datasource paginator.
    this.dataSource.paginator = this.paginator;
    // Set datasource sort.
    this.dataSource.sorter = this.sort;

    // Prevent ExpressionChangedAfterItHasBeenCheckedErrors using setTimeout
    // maybe loadData and paginator settings in ngOnInit would be better
    setTimeout(() => {
      // console.log('#Table - ngAfterViewInit - paginator settings');

      // Hide the paginator pagesize combo.
      this.paginator.hidePageSize = true;

      // Init the paginator with the startup page index.
      this.paginator.pageIndex = 0;
    }, 0)
  }

  public onAfterLoadData(): void {
    // console.log('#Table - onAfterLoadData');

    // Update paginator total number of rows (needed!)
    this.paginator.length = this.dataSource.totalNrOfRows;

    // Update the table rows.
    this.table.renderRows();

    this.initFiltering();

    // FOR TESTING. SHOW TABLE OPTIONS FORM AT STARTUP.
    // this.onTableOptionsClick(null);
  }

  public getColumns(includeSpecial: boolean): AttributelistColumn[] {
    return this.dataSource.columnController.getActiveColumns(includeSpecial);
  }

  /**
   * Return the column names. Include special column names.
   */
  public getColumnNames(): string[] {
    const colNames = this.dataSource.columnController.getActiveColumnNames(true);
    // console.log(colNames);
    return colNames;
  }

  public getColumnWidth(name: string): string {
    console.log('#Table - getColumnWidth - ' + name);
    return '180px';
  }

  /**
   * Returns if the bar with the button should be visible.
   */
  public getFooterBarVisible(): string {
    if (this.nrChecked === 0) {
      return 'none';
    } else {
      return 'block';
    }
  }

  /**
   * Fired when the checkbox in the header is clicked.
   */
  public onHeaderCheckClick(): void {
    const currCheckState = this.checkState;
    if (currCheckState === CheckState.All) {
      this.dataSource.checkNone();
    } else {
      this.dataSource.checkAll();
    }
    // Update check info.
    this.updateCheckedInfo();
  }

  public onObjectOptionsClick(): void {
    alert('Not yet implemented.');
  }

  public onPageChange(event): void {
    // console.log('#Table - onPageChange');
    // Fire page change event.
    this.pageChange.emit();
    // Update the table.
    this.updateTable();
  }

  /**
   * Fired when a checkbox is clicked.
   */
  public onRowCheckClick(row: RowData): void {
    // console.log('#Table - onRowCheckClick');
    // console.log(row);
    // Toggle the checkbox in the checked row.
    this.dataSource.toggleChecked(row);
    // Update check info.
    this.updateCheckedInfo();
  }

  /**
   * Fired when a expand/collapse icon/char is clicked.
   */
  public onRowExpandClick(row: RowData): void {
    // console.log('#Table - onRowExpandClick');
    // console.log(row);
    if (row.hasOwnProperty('_detailsRow')) {
      // Toggle the expanded/collapsed state of the row.
      row._detailsRow.toggle();
    }
  }

  /**
   * Fired when a row is clicked.
   */
  public onRowClick(row: RowData): void {
    // console.log('#Table - onRowClicked');
    // console.log(row);

    // FOR TESTING
    // row.geometrie = '';
    // delete row.geometrie;

    // Check for geometrie field (needed for highlighting).
    if (!row.hasOwnProperty('geometrie') || (row.geometrie === '')) {
      this.snackBar.open('Zoomen naar dit object is niet mogelijk.', 'Sluiten', {
        duration: 1000,
      });
      return;
    }
    const data: RowClickData = {
      feature: row,
      layerId: this.dataSource.getLayerId(),
    };
    this.rowClick.emit(data);
  }

  /**
   * Fired when a column header is clicked.
   */
  public onSortClick(sort: Sort): void {
    // Reset the paginator page index.
    this.paginator.pageIndex = 0;
    // Update the table.
    this.updateTable();
  }

  /**
   * Fired when a column filter is clicked.
   */
  public onFilterClick(columnName: string): void {
    // Get the unique values for this column
    this.valueParams.applicationLayer = this.dataSource.params.layerId;
    this.valueParams.attributes = [];
    this.valueParams.attributes.push (columnName);
    this.valueService.uniqueValues(this.valueParams).subscribe((data: UniqueValuesResponse) => {
      if (data.success) {
        let uniqueValues: FilterValueSettings[];
        uniqueValues = [];
        const colObject = this.filter.layerFilterValues.columns.find(c => c.name === columnName);
        const colIndex = this.filter.layerFilterValues.columns.findIndex(obj => obj.name === columnName);
        if (colObject.uniqueValues.length === 0) {

          data.uniqueValues[columnName].forEach(val => {
            let filterValueSettings: FilterValueSettings;
            filterValueSettings = {value: val, select: true};
            uniqueValues.push(filterValueSettings);
          })
        } else {
            colObject.uniqueValues.forEach(val => uniqueValues.push(Object.assign({}, val)))
        }

        const config = new MatDialogConfig();
        config.data = {
          colName: columnName,
          values: uniqueValues,
        };
        const dialogRef = this.dialog.open(AttributelistFilterValuesFormComponent, config);
        dialogRef.afterClosed().subscribe(filterSetting => {
          // Do the filtering
          if (filterSetting !== 'CANCEL') {
            if (filterSetting === 'ON') {
              this.filter.layerFilterValues.columns[colIndex].uniqueValues = config.data.values;
              this.filter.layerFilterValues.columns[colIndex].nullValue = false;
              this.filter.layerFilterValues.columns[colIndex].status = true;
            } else if (filterSetting === 'NONE') {
              this.filter.layerFilterValues.columns[colIndex].uniqueValues = config.data.values;
              this.filter.layerFilterValues.columns[colIndex].nullValue = true;
              this.filter.layerFilterValues.columns[colIndex].status = true;
            } else if (filterSetting === 'OFF') {
              this.filter.layerFilterValues.columns[colIndex].uniqueValues = [];
              this.filter.layerFilterValues.columns[colIndex].nullValue = false;
              this.filter.layerFilterValues.columns[colIndex].status = false;
            }
            this.dataSource.params.valueFilter = this.filter.createFilter();
            this.updateTable();
          }
        });
      }
    });
  }

  /**
   * Check if a filter is active on a column
   */
  public getIsFilterActive(columnName): boolean {
    const colObject = this.filter.layerFilterValues.columns.find(c => c.name === columnName);
    let result: boolean;
    if (colObject) {
      result = colObject.status;
    } else {
      result = false;
    }
    return result;
  }

  /**
   * Shows a popup to set visible columns.
   */
  public onTableOptionsClick(evt: MouseEvent): void {

    // Get the target for setting the dialog position.
    let target = null;
    if (evt !== null) {
      target = new ElementRef(evt.currentTarget);
    }

    // Create and set the dialog config.
    const config = new MatDialogConfig();

    // Show transparent backdrop, click outside dialog for closing.
    config.backdropClass = 'cdk-overlay-backdrop';

    // Possible additional settings:
    //     config.hasBackdrop = false;     // Don't show a gray mask.
    //     config.maxHeight = '100px';
    //     config.height = '300px';
    //     config.panelClass = 'attributelist-table-options-form';

    config.data = {
      trigger: target,
      columnController: this.dataSource.columnController,
    };
    const dialogRef = this.dialog.open(AttributelistTableOptionsFormComponent, config);
    dialogRef.afterClosed().subscribe(value => {
      // Collapse all rows.
      this.dataSource.resetExpanded();
    });
  }

  public onTest(): void {
    // console.log('#Table.onTest');
    // this.table.renderRows();

    // // Get passport field/column names.
    // console.log(this.formconfigRepoService.getAllFormConfigs());
    // const passportName = 'wegvakonderdeel';
    // this.formconfigRepoService.formConfigs$.subscribe(formConfigs => {
    //     const formConfig = formConfigs.config[passportName];
    //     console.log(formConfig);
    //   },
    //   ()=>{},
    //   ()=> {
    //     console.log('onTest - complete');
    // });
  }

  public setTabIndex(tabIndex: number): void {
    // console.log('#Table - setTabIndex');
    // Set corresponding tab index.
    this.tabIndex = tabIndex;
    // Get layer.
    const layer = this.layerService.getLayerByTabIndex(this.tabIndex);
    // console.log(layer);
    if (layer.name === '') {
      return;
    }
    // Set params layer name and id.
    this.dataSource.params.layerName = layer.name;
    this.dataSource.params.layerId = layer.id;
    // Update table.
    this.updateTable();
  }

  private updateCheckedInfo(): void {
    // Update the number checked.
    this.nrChecked = this.dataSource.getNrChecked();
    // Update the check state.
    this.checkState = this.dataSource.getCheckState(this.nrChecked);
  }

  private updateTable(): void {
    // (Re)load data. Fires the onAfterLoadData method.
    this.dataSource.loadData(this);
    // Update check info (number checked/check state).
    this.updateCheckedInfo();
  }

  private initFiltering(): void {
    // Init the filter structure
    this.filter.layerFilterValues.layerId = this.dataSource.params.layerId;
    const colNames = this.getColumnNames();
    for (const colName of colNames) {
      let filterColumn: FilterColumns;
      filterColumn = {name: colName, status: false, nullValue: false, uniqueValues: []};
      this.filter.layerFilterValues.columns.push(filterColumn);
    }
  }
}
