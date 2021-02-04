import { Component, Input, OnDestroy, OnInit, TrackByFunction, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AttributelistTable } from '../attributelist-common/attributelist-models';
import { AttributeDataSource } from '../attributelist-common/attributelist-datasource';
import { AttributelistFilter } from '../attributelist-common/attributelist-filter';
import { AttributelistService } from '../attributelist.service';
import { AttributelistStatistic } from '../attributelist-common/attributelist-statistic';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { CheckState } from '../attributelist-common/attributelist-enums';
import { Feature } from '../../../shared/generated';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { StatisticTypeInMenu } from '../attributelist-common/attributelist-statistic-models';
import { StatisticService } from '../../../shared/statistic-service/statistic.service';
import { StatisticType } from '../../../shared/statistic-service/statistic-models';
import { ValueService } from '../../../shared/value-service/value.service';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { from, Observable, Subject } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { AttributelistTreeComponent } from '../attributelist-tree/attributelist-tree.component';
import { AttributelistNode, SelectedTreeData, TreeDialogData } from '../attributelist-tree/attributelist-tree-models';
import { AttributelistColumnController } from '../attributelist-common/attributelist-column-controller';
import { FormComponent } from '../../../feature-form/form/form.component';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectTab } from '../state/attribute-list.selectors';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import {
  toggleCheckedAllRows, updatePage, updateRowChecked, updateRowExpanded, updateRowSelected, updateSort,
} from '../state/attribute-list.actions';
import { AttributeListRowModel } from '../models/attribute-list-row.model';

@Component({
  selector: 'tailormap-attribute-tab-content',
  templateUrl: './attribute-list-tab-content.component.html',
  styleUrls: ['./attribute-list-tab-content.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AttributeListTabContentComponent implements AttributelistTable, OnInit, OnDestroy {

  @Input()
  public layerId: string;

  @ViewChild(MatPaginator)
  private paginator: MatPaginator;

  @ViewChild(MatSort)
  private sort: MatSort;

  @ViewChild('table')
  public table: MatTable<any>;

  @ViewChild(MatMenuTrigger)
  private statisticsMenu: MatMenuTrigger;

  public columnController: AttributelistColumnController;

  public dataSource = new AttributeDataSource(this.attributeService,
                                              this.valueService,
                                              this.attributelistService,
                                              this.tailorMapService,
                                              this.formconfigRepoService);
  public checkedRows = [];
  public treeData: AttributelistNode[] = [];

  private selectedTreeData: SelectedTreeData;

  private isAttributeTreeOpen = false;

  private filterMap = new Map<number, AttributelistFilter>();

  private isRelatedRefresh = false;

  private rowsChecked;

  public statistic = new AttributelistStatistic(
    this.statisticsService,
    this.dataSource,
  );

  // Number of checked rows.
  public nrChecked = 0;

  // State of checked rows ('All','None','Some').
  public checkState = CheckState.None;

  /**
   * Declare enums to use in template
   */
  public eStatisticType = StatisticType;
  public eStatisticTypeInMenu = StatisticTypeInMenu;

  public keys = Object.keys;

  public values = Object.values;

  public contextMenuPosition = { x: '0px', y: '0px' };

  private destroyed = new Subject();

  public tab: AttributeListTabModel;
  public rows$: Observable<AttributeListRowModel[]>;
  public trackByRowId: TrackByFunction<AttributeListRowModel> = (idx: number, row: AttributeListRowModel) => row.rowId;

  constructor(private store$: Store<AttributeListState>,
              private attributeService: AttributeService,
              private statisticsService: StatisticService,
              private tailorMapService: TailorMapService,
              private valueService: ValueService,
              public attributelistService: AttributelistService,
              private formconfigRepoService: FormconfigRepositoryService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {}

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public ngOnInit(): void {
    this.store$.select(selectTab, this.layerId)
      .pipe(takeUntil(this.destroyed))
      .subscribe(tab => {
        this.tab = tab;
        const someUnchecked = tab.rows.findIndex(row => !row._checked) !== -1;
        const someChecked = tab.rows.findIndex(row => row._checked) !== -1;
        this.checkState = someChecked && someUnchecked ? CheckState.Some : (someUnchecked ? CheckState.None : CheckState.All);
      });

    this.rows$ = this.store$.select(selectTab, this.layerId).pipe(
      takeUntil(this.destroyed),
      map(tab => tab.rows),
    );

    // called from passport form
    this.attributelistService.loadTableData$.pipe(takeUntil(this.destroyed)).subscribe(result => {
      // reload only table if the savedFeature is the same as the main feature for this table
      if (result === this.dataSource.mainFeatureClazzName) {
        this.refreshTable();
      }
    });

    this.attributelistService.afterLoadRelatedData$.pipe(takeUntil(this.destroyed)).subscribe((result) => {
      this.afterloadRelatedData();
    });

    // called from attribute tree
    this.attributelistService.selectedTreeData$.pipe(takeUntil(this.destroyed)).subscribe(selectedTreeData => {
      if (!selectedTreeData.isChild) {
        this.dataSource.params.featureTypeId = -1;
        this.dataSource.params.featureTypeName = '';
        this.dataSource.params.featureFilter = '';
        this.dataSource.params.valueFilter = '';
      } else {
        this.dataSource.params.featureTypeId = selectedTreeData.params.featureType;
        this.dataSource.params.featureFilter = selectedTreeData.params.filter;
        this.dataSource.params.featureTypeName = selectedTreeData.name;
      }
      this.selectedTreeData = selectedTreeData;
      this.isRelatedRefresh = false;
      this.dataSource.loadTableData(this, selectedTreeData);
    });
  }

  private afterloadRelatedData(): void {
    this.paginator.length = this.dataSource.totalNrOfRows;

    // Update the table rows.
    this.table.renderRows();

    this.filterMap.get(this.dataSource.params.featureTypeId).initFiltering(this.getColumnNames());
    this.statistic.initStatistics(this.getColumnNames());
    this.updateCheckedInfo();
  }

  public onAfterLoadData(): void {
    // console.log('#Table - onAfterLoadData');

    // Update paginator total number of rows (needed!)
    this.paginator.length = this.dataSource.totalNrOfRows;

    // Update the table rows.
    this.table.renderRows();

    if (this.rowsChecked) {
      this.dataSource.setAllRowsChecked();
    }

    this.filterMap.get(this.dataSource.params.featureTypeId).initFiltering(this.getColumnNames());

    this.statistic.initStatistics(this.getColumnNames());

    this.onObjectOptionsClick();

    this.updateCheckedInfo();
  }

  public getVisibleColumns() {
    return this.tab.columns.filter(c => c.visible);
  }

  /**
   * Return the column names. Include special column names.
   */
  public getColumnNames(): string[] {
    return this.getVisibleColumns().map(c => c.name);
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
  public onHeaderCheckClick($event: MouseEvent): void {
    $event.stopPropagation();
    this.store$.dispatch(toggleCheckedAllRows({ layerId: this.tab.layerId }));
  }

  // Creates a filter for all the checked features in the maintable on the related tabled
  private createFeatureFilterForCheckedFeatures(): void {
    let filter = '';
    const checkedFeatures = this.dataSource.getAllRowAsAttributeListFeature(true);
    const filterForFeatureTypes = new Map<number, string>();
    checkedFeatures.forEach((row) => {
      const related = row.related_featuretypes;
      related.forEach((r) => {
        if (filterForFeatureTypes.has(r.id)) {
          filter = filterForFeatureTypes.get(r.id);
          const value = r.filter.split('=')[1].split(' ')[1];
          filterForFeatureTypes.set(r.id, filter += ', ' + value );
        } else {
          const column = r.filter.split('=')[0].split(' ')[0];
          const value = r.filter.split('=')[1].split(' ')[1];
          filterForFeatureTypes.set(r.id, column + ' IN (' + value);
        }
      });
    });
    filterForFeatureTypes.forEach((value, key) => {
      this.filterMap.get(key).setFeatureFilter(filterForFeatureTypes.get(key) + ')');
      if (this.filterMap.get(-1).getFeatureFilter().length <= 0) {
        this.filterMap.get(-1).setFeatureFilter(filterForFeatureTypes.get(key) + ')');
      }
    });
  }

  private creaFeatureFilterForAllFeatures(): void {
    const uniqueValues = this.dataSource.uniqueMainFeatureIds;
    const filterForFeatureTypes = new Map<number, string>();
    uniqueValues.forEach((values, key) => {
        const column = this.dataSource.relatedRightSides.get(key);
        let filter = column + ' IN (';
        values.forEach((val) => {
          filter += '\'' + val + '\',';
        });
        filter = filter.slice(0, -1);
        filter += ')';
        filterForFeatureTypes.set(key, filter);
    });
    filterForFeatureTypes.forEach((value, key) => {
      this.filterMap.get(key).setFeatureFilter(filterForFeatureTypes.get(key));
    });
  }

  public onObjectOptionsClick(): void {
    this.treeData = [];
    this.dataSource.getCheckedRowsAsFeatures();
    // Set params layer name and id.
    this.dataSource.params.layerName = this.tab.layerName;
    this.dataSource.params.layerId = +(this.tab.layerId);
    let features;
    let numberOfFeatures;
    if (this.dataSource.getNrChecked() > 0 ) {
      this.createFeatureFilterForCheckedFeatures();
      this.rowsChecked = true;
      features = this.dataSource.getAllRowAsAttributeListFeature(true);
      numberOfFeatures = this.dataSource.getNrChecked();
    } else {
      if (this.filterMap.get(-1).getFinalFilter(this.filterMap)) {
        this.creaFeatureFilterForAllFeatures();
      } else {
        this.filterMap.forEach((filter, key) => {
          filter.setFeatureFilter('');
        })
      }
      this.rowsChecked = false;
      features = this.dataSource.getAllRowAsAttributeListFeature();
      numberOfFeatures = this.dataSource.totalNrOfRows;
    }

    // push the data in the attributeTree that belongs to the mainFeature
    this.treeData.push({
      name: this.tab.layerAlias,
      numberOfFeatures,
      features,
      params: {
        application: this.tailorMapService.getApplicationId(),
        appLayer: +(this.tab.layerId),
      },
      isChild: false,
      columnNames: this.dataSource.columnController.getPassPortColumnsAsColumns(),
      children: [],
    });
    from(this.dataSource.getRelatedFeaturesAsArray()).pipe(concatMap(feature => {
      this.dataSource.params.featureTypeId = feature.id;
      this.dataSource.params.featureTypeName = feature.foreignFeatureTypeName;
      this.dataSource.params.valueFilter = this.filterMap.get(feature.id).getFinalFilter(this.filterMap);
      return this.dataSource.loadDataForAttributeTree$(this.tab.pageSize);
    })).subscribe({
      next: (result) => {
        this.setTreeData(result);
      },
      complete: () => {
        this.dataSource.params.featureTypeId = -1;
        this.dataSource.params.featureTypeName = '';
        this.dataSource.params.featureFilter = '';
        if (this.isRelatedRefresh) {
          this.isRelatedRefresh = false;
          this.attributelistService.updateTreeData(this.treeData);
          if (this.selectedTreeData.isChild) {
            if (this.treeData[0].children.length > 0) {
              this.treeData[0].children.forEach((data) => {
                if (data.params.featureType === this.selectedTreeData.params.featureType) {
                  this.selectedTreeData = {
                    features: data.features,
                    params: data.params,
                    isChild: data.isChild,
                    name: data.name,
                    columnNames: data.columnNames,
                    numberOfFeatures: data.numberOfFeatures,
                  }
                }
              });
            } else {
              this.selectedTreeData = null;
            }
          } else {
            this.selectedTreeData = {
              features: this.treeData[0].features,
              params: this.treeData[0].params,
              isChild: this.treeData[0].isChild,
              name: this.treeData[0].name,
              columnNames: this.treeData[0].columnNames,
              numberOfFeatures: this.treeData[0].numberOfFeatures,
            }
          }
          this.attributelistService.setSelectedTreeData(this.selectedTreeData);
        } else {
          this.selectedTreeData = {
            features: this.treeData[0].features,
            params: this.treeData[0].params,
            isChild: this.treeData[0].isChild,
            name: this.treeData[0].name,
            columnNames: this.treeData[0].columnNames,
            numberOfFeatures: this.treeData[0].numberOfFeatures,
          }
          this.attributelistService.updateTreeData(this.treeData);
          this.attributelistService.setSelectedTreeData(this.selectedTreeData);
        }
      },
    })
  }

  public setTreeData(values: AttributelistNode) {
    this.treeData[0].children.push(values);
  }

  public openDialog() {
    if (this.dataSource.getNrChecked() > 0) {
      this.onObjectOptionsClick();
    }
    if (this.isAttributeTreeOpen) {
      return;
    }
    const dialogData : TreeDialogData = {
      rowsChecked: this.nrChecked,
      tree: this.treeData,
    };
    const dialogRef = this.dialog.open(AttributelistTreeComponent, {
      width: '400px',
      data: dialogData,
      position: {
        right: '50px',
      },
      hasBackdrop: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      // if dialog is closed set params for mainTable feature
      // and fill selectedTreeData with the mainTable features
      this.dataSource.params.featureTypeId = -1;
      this.dataSource.params.featureTypeName = '';
      this.dataSource.params.featureFilter = '';
      this.dataSource.params.valueFilter = '';
      this.selectedTreeData = {
        features: this.treeData[0].features,
        params: this.treeData[0].params,
        isChild: this.treeData[0].isChild,
        name: this.treeData[0].name,
        columnNames: this.treeData[0].columnNames,
        numberOfFeatures: this.treeData[0].numberOfFeatures,
      };
      this.attributelistService.setSelectedTreeData(this.selectedTreeData);
      this.isAttributeTreeOpen = false;
    });
    dialogRef.afterOpened().subscribe( result => {
      this.isAttributeTreeOpen = true;
    });
  }

  public afterEditing(optionFeatures: Feature[]): void {
    this.dataSource.setCheckedRows(optionFeatures);
    this.updateTable();
  }

  public onPageChange($event: PageEvent): void {
    this.store$.dispatch(updatePage({ layerId: this.tab.layerId, page: $event.pageIndex }));
  }

  /**
   * Fired when a checkbox is clicked.
   */
  public onRowCheckClick($event: MouseEvent, row: AttributeListRowModel): void {
    $event.stopPropagation();
    this.store$.dispatch(updateRowChecked({ layerId: this.tab.layerId, rowId: row.rowId, checked: !row._checked }));
  }

  /**
   * Fired when a expand/collapse icon/char is clicked.
   */
  public onRowExpandClick($event: MouseEvent, row: AttributeListRowModel): void {
    $event.stopPropagation();
    this.store$.dispatch(updateRowExpanded({ layerId: this.tab.layerId, rowId: row.rowId, expanded: !row._expanded }));
  }

  /**
   * Fired when a row is clicked.
   */
  public onRowClick($event: MouseEvent, row: AttributeListRowModel): void {
    $event.stopPropagation();
    this.store$.dispatch(updateRowSelected({ layerId: this.tab.layerId, rowId: row.rowId, selected: !row._selected }));
  }

  /**
   * Fired when a column header is clicked.
   */
  public onSortClick(sort: Sort): void {
    this.store$.dispatch(updateSort({ layerId: this.tab.layerId, column: sort.active, direction: sort.direction }));
  }

  /**
   * Fired when a column filter is clicked.
   */
  public onFilterClick(columnName: string): void {
    // this.dataSource.columnController.columnNamesToColumns()
    this.filterMap.get(this.dataSource.params.featureTypeId).setFilter(this, columnName);
  }

  public onClearLayerFilter() {
    this.filterMap.get(this.dataSource.params.featureTypeId).clearFilterForLayer(this.filterMap, this.rowsChecked);
    this.refreshTable();
  }

  public onClearAllFilters() {
    this.rowsChecked = false;
    this.filterMap.forEach( (filter, key) => {
      filter.clearFilter(this);
    });
    this.refreshTable();
  }

  /**
   * After setting filter(s) refresh the table
   */
  public refreshTable(): void {
    if (this.dataSource.params.hasDetail()) {
      this.dataSource.params.featureTypeId = -1;
      this.dataSource.params.featureTypeName = '';
      this.dataSource.params.featureFilter = '';
      this.dataSource.columnController.setPassportColumnNames(this.treeData[0].columnNames);
      this.isRelatedRefresh = true;
    } else {
      this.isRelatedRefresh = false;
    }
    this.dataSource.params.valueFilter = this.filterMap.get(-1).getFinalFilter(this.filterMap);
    this.paginator.pageIndex = 0;
    this.updateTable();
    this.setFilterInAppLayer();
    this.statistic.refreshStatistics(this.dataSource.params.layerId, this.dataSource.params.valueFilter);
  }

  private setFilterInAppLayer() {
    const viewerController = this.tailorMapService.getViewerController();
    const appLayer = viewerController.getAppLayerById(this.filterMap.get(this.dataSource.params.featureTypeId).layerFilterValues.layerId);
    const cql = this.dataSource.params.valueFilter;
    viewerController.setFilterString(cql, appLayer, 'ngattributelist');
  }

  /**
   * Check if a filter is active on a column
   */
  public getIsFilterActive(columnName): boolean {
    if (this.filterMap.size <= 0) {
      return false;
    }
    const colObject = this.filterMap.get(this.dataSource.params.featureTypeId).layerFilterValues.columns.find(c => c.name === columnName);
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

  private updateCheckedInfo(): void {
    // Update the number checked.
    this.nrChecked = this.dataSource.getNrChecked();
    // Update the check state.
    this.checkState = this.dataSource.getCheckState(this.nrChecked);
  }

  private updateTable(): void {
    // (Re)load data. Fires the onAfterLoadData method.
    this.dataSource.loadData(this, this.tab.pageSize, this.tab.pageIndex);
    this.columnController = this.dataSource.columnController;
    // Update check info (number checked/check state).
    this.updateCheckedInfo();
  }

  public initFilterMap(): void {
    this.dataSource.getMetaData$().subscribe((response) => {
      this.setFilterMap(-1);
      response.relations.forEach((rel) => {
        this.setFilterMap(rel.foreignFeatureType);
      });
    });
  }

  public setFilterMap(featureTypeId: number) {
    this.filterMap.set(featureTypeId, new AttributelistFilter(
      this.dataSource,
      this.valueService,
      this.dialog,
    ));
  }

  public openPassportDialog(): void {
    const formFeatures = this.dataSource.getCheckedRowsAsFeatures();
    if (formFeatures.length <= 0) {
      this.snackBar.open('Er zijn geen features geselecteerd', '', {
        duration: 5000,
      });
      return;
    }
    this.dialog.open(FormComponent, {
      width: '1050px',
      height: '800px',
      disableClose: true,
      data: {
        formFeatures,
        isBulk: formFeatures.length > 1,
        closeAfterSave: true,
      },
    });
  }

  public isRelatedFeatures(): boolean {
    return this.dataSource.getRelatedFeaturesAsArray().length > 0;
  }

  public getCheckIcon() {
    if (this.checkState === 'All') {
      return 'check_box';
    }
    if (this.checkState === 'None') {
      return 'check_box_outline_blank';
    }
    return 'indeterminate_check_box';
  }
}
