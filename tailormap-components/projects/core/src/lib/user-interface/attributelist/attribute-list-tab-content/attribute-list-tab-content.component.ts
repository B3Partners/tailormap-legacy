import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttributelistTable } from '../attributelist-common/attributelist-models';
import { AttributeDataSource } from '../attributelist-common/attributelist-datasource';
import { AttributelistFilter } from '../attributelist-common/attributelist-filter';
import { AttributelistService } from '../attributelist.service';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { Feature } from '../../../shared/generated';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { ValueService } from '../../../shared/value-service/value.service';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { from, Subject } from 'rxjs';
import { concatMap, takeUntil } from 'rxjs/operators';
import { AttributelistTreeComponent } from '../attributelist-tree/attributelist-tree.component';
import { AttributelistNode, SelectedTreeData, TreeDialogData } from '../attributelist-tree/attributelist-tree-models';
import { AttributelistColumnController } from '../attributelist-common/attributelist-column-controller';
import { FormComponent } from '../../../feature-form/form/form.component';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectTab } from '../state/attribute-list.selectors';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { updatePage } from '../state/attribute-list.actions';

@Component({
  selector: 'tailormap-attribute-tab-content',
  templateUrl: './attribute-list-tab-content.component.html',
  styleUrls: ['./attribute-list-tab-content.component.css'],
})
export class AttributeListTabContentComponent implements AttributelistTable, OnInit, OnDestroy {

  @Input()
  public layerId: string;

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

  // Number of checked rows.
  public nrChecked = 0;

  private destroyed = new Subject();

  public tab: AttributeListTabModel;

  constructor(private store$: Store<AttributeListState>,
              private attributeService: AttributeService,
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
        this.nrChecked = this.tab.rows.filter(r => r._checked).length;
      });

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
    // this.filterMap.get(this.dataSource.params.featureTypeId).initFiltering(this.getColumnNames());
  }

  public onAfterLoadData(): void {
    // this.filterMap.get(this.dataSource.params.featureTypeId).initFiltering(this.getColumnNames());
    this.onObjectOptionsClick();
  }

  public getVisibleColumns() {
    return this.tab.columns.filter(c => c.visible);
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
    this.updateTable();
    this.setFilterInAppLayer();
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

  private updateTable(): void {
    // (Re)load data. Fires the onAfterLoadData method.
    this.dataSource.loadData(this, this.tab.pageSize, this.tab.pageIndex);
    this.columnController = this.dataSource.columnController;
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

}
