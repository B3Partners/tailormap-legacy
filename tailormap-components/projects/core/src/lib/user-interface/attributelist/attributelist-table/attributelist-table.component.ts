import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import {
  MatSort,
  Sort,
} from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import {
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  AttributelistTable,
  AttributelistForFilter,
  RowClickData,
  RowData,
} from '../attributelist-common/attributelist-models';
import { AttributeDataSource } from '../attributelist-common/attributelist-datasource';
import { AttributelistFilter } from '../attributelist-common/attributelist-filter';
import { AttributelistTableOptionsFormComponent } from '../attributelist-table-options-form/attributelist-table-options-form.component';
import { AttributelistService } from '../attributelist.service';
import { AttributelistStatistic } from '../attributelist-common/attributelist-statistic';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { CheckState } from '../attributelist-common/attributelist-enums';
import { Feature } from '../../../shared/generated';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { LayerService } from '../layer.service';
import { StatisticTypeInMenu } from '../attributelist-common/attributelist-statistic-models';
import { StatisticService } from '../../../shared/statistic-service/statistic.service';
import { StatisticType } from '../../../shared/statistic-service/statistic-models';
import { ValueService } from '../../../shared/value-service/value.service';
import { FormComponent } from '../../../feature-form/form/form.component';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { HighlightService } from '../../../shared/highlight-service/highlight.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { AttributelistColumn } from '../attributelist-common/attributelist-column-models';
import { AttributelistColumnController } from '../attributelist-common/attributelist-column-controller';
// import { LiteralMapKey } from '@angular/compiler';

@Component({
  selector: 'tailormap-attributelist-table',
  templateUrl: './attributelist-table.component.html',
  styleUrls: ['./attributelist-table.component.css'],
  animations: [
    trigger('onDetailsExpand', [
      state('void', style({height: '0px', minHeight: '0', visibility: 'hidden'})),
      state('*', style({height: '*', visibility: 'visible'})),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AttributelistTableComponent implements AttributelistTable, AttributelistForFilter, OnInit, AfterViewInit {

  @ViewChild(MatPaginator) private paginator: MatPaginator;
  @ViewChild(MatSort) private sort: MatSort;

  // Table reference for 'manually' rendering.
  @ViewChild('table') public table: MatTable<any>;

  @ViewChild(MatMenuTrigger)
  private statisticsMenu: MatMenuTrigger;

  @Output()
  public pageChange = new EventEmitter();

  @Output()
  public rowClick = new EventEmitter<RowClickData>();

  @Output()
  public tabChange = new EventEmitter();

  public columnController: AttributelistColumnController;

  public dataSource = new AttributeDataSource(this.layerService,
                                              this.attributeService,
                                              this.tailorMapService,
                                              this.formconfigRepoService);

  public filter = new AttributelistFilter(
    this.dataSource,
    this.valueService,
    this.dialog,
  );

  public statistic = new AttributelistStatistic(
    this.statisticsService,
    this.dataSource,
    );

  // Number of checked rows.
  public nrChecked = 0;

  // State of checked rows ('All','None','Some').
  public checkState = CheckState.None;

  private tabIndex = -1;

  /**
   * Declare enums to use in template
   */
  public eStatisticType = StatisticType;
  public eStatisticTypeInMenu = StatisticTypeInMenu;

  public keys = Object.keys;

  public values = Object.values;

  public contextMenuPosition = { x: '0px', y: '0px' };

  // private standardFormWorkflow = new StandardFormWorkflow();

  constructor(private attributeService: AttributeService,
              private layerService: LayerService,
              private statisticsService: StatisticService,
              private tailorMapService: TailorMapService,
              private valueService: ValueService,
              public attributelistService: AttributelistService,
              private formconfigRepoService: FormconfigRepositoryService,
              private highlightService: HighlightService,
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

    this.filter.initFiltering(this.getColumnNames());

    this.statistic.initStatistics(this.getColumnNames());

    this.updateCheckedInfo();

    // FOR TESTING. SHOW TABLE OPTIONS FORM AT STARTUP.
    // this.onTableOptionsClick(null);
  }

  public getActiveColumns(includeSpecial: boolean): AttributelistColumn[] {
    return this.dataSource.columnController.getActiveColumns(includeSpecial);
  }

  /**
   * Return the column names. Include special column names.
   */
  public getColumnNames(): string[] {
    const colNames = this.dataSource.columnController.getVisibleColumnNames(true);
    // console.log(colNames);
    return colNames;
  }

  /**
   * Returns numeric when statistic functions like min, max, average are possible
   */
  public getStatisticFunctionColumnType(name: string): string {
    return this.statistic.getStatisticFunctionColumnType(name);
  }

  public getColumnWidth(name: string): string {
    // console.log('#Table - getColumnWidth - ' + name);
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
    let optionFeatures: Feature[];
    optionFeatures = this.dataSource.getCheckedRowsAsFeatures();
    this.openDialog(optionFeatures);
  }

  public openDialog(formFeatures ?: Feature[]): void {
    const dialogRef = this.dialog.open(FormComponent, {
      width: '1050px',
      height: '800px',
      disableClose: true,
      data: {
        formFeatures,
        isBulk: formFeatures.length > 1,
      },
    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      this.afterEditing(formFeatures);
    });
  }

  public afterEditing(optionFeatures: Feature[]): void {
    this.dataSource.setCheckedRows(optionFeatures);
    this.updateTable();
  }

  public onPageChange(event): void {
    // console.log('#Table - onPageChange');

    // Fire page change event.
    this.pageChange.emit();

    // Clear highligthing.
    this.highlightService.clearHighlight();

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

    // OM TE TESTEN!!!
    // if (row.__fid.indexOf('.2')>=0) {
    //   row.__fid = '';
    // }

    // Get zoomto buffer size.
    const zoomToBuffer = this.attributelistService.config.zoomToBuffer;

    // Highlight and zoom to clicked feature.
    const appLayer = this.layerService.getLayerByTabIndex(this.tabIndex);
    this.highlightService.highlightFeature(row.__fid, appLayer.id, true, zoomToBuffer);
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
    this.filter.setFilter(this, columnName);
  }

  /**
   * After setting filter(s) refresh the table
   */
  public refreshTable(): void {
    this.paginator.pageIndex = 0;
    this.updateTable();
    this.setFilterInAppLayer();
    this.statistic.refreshStatistics(this.dataSource.params.layerId, this.dataSource.params.valueFilter);
  }

  private setFilterInAppLayer() {
    const viewerController = this.tailorMapService.getViewerController();
    const appLayer = viewerController.getAppLayerById(this.filter.layerFilterValues.layerId);
    const cql = this.filter.createFilter();
    viewerController.setFilterString(cql, appLayer, 'ngattributelist');
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
   * Fired when a cell on footer row is clicked.
   */
  public onStatisticsMenu(event: MouseEvent, colName: string) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.statisticsMenu.menuData = { colName };
    this.statisticsMenu.menu.focusFirstItem('mouse');
    this.statisticsMenu.openMenu()
  }

  public onStatisticsMenuClick(colName: string, statisticType: StatisticType) {
    this.statistic.setStatistics(colName, statisticType, this.dataSource.params.layerId, this.dataSource.params.valueFilter);
  }

  public getStatisticTypeInMenu(colName: string): string {
    return this.statistic.getStatisticTypeInMenu(colName);
  }

  public getStatisticResult(colName: string): string {
    return this.statistic.getStatisticResult(colName);
  }

  public isStatisticsProcessing(colName: string): boolean {
    return this.statistic.isStatisticsProcessing(colName);
  }

  public onStatisticsHelp(): void {
    this.snackBar.open('Open contextmenu in de betreffende kolom voor statistiche functies', 'Sluiten', {
      duration: 5000,
    });
    return;
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
    // console.log('table.comp setTabIndex: ' + this.tabIndex)
    // Get layer.
    const layer = this.layerService.getLayerByTabIndex(this.tabIndex);
    // console.log('table.comp layername: ' + layer.name)
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
    this.columnController = this.dataSource.columnController;
    // Update check info (number checked/check state).
    this.updateCheckedInfo();
  }

}
