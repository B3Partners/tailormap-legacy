/**
 * Datasource for the main table and details tables.
 *
 * Remarks:
 * - In case of the main table, adds an extra '_checked' column to the rows.
 * - In case of the main table, adds an extra '_details' column to the rows.
 */

import { DataSource } from '@angular/cdk/table';
import * as wellknown from 'wellknown';
import { forkJoin, Observable, of, Subject } from 'rxjs';

import { AttributelistTable, RowData } from './attributelist-models';
import { AttributelistColumnController } from './attributelist-column-controller';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import {
  Attribute, AttributeListFeature, AttributeListParameters, AttributeListResponse, AttributeMetadataParameters, AttributeMetadataResponse,
  RelatedFeatureType,
} from '../../../shared/attribute-service/attribute-models';
import { CheckState, DetailsState } from './attributelist-enums';
import { DatasourceParams } from './datasource-params';
import { Feature } from '../../../shared/generated';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { LayerUtils } from '../../../shared/layer-utils/layer-utils.service';
import { FormConfiguration } from '../../../feature-form/form/form-models';
import { map, take, takeUntil } from 'rxjs/operators';
import { AttributelistNode, SelectedTreeData } from '../attributelist-tree/attributelist-tree-models';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { AttributelistService } from '../attributelist.service';
import { ValueService } from '../../../shared/value-service/value.service';
import { ValueParameters } from '../../../shared/value-service/value-models';
import { selectFormConfigForFeatureType, selectFormConfigs } from '../../../feature-form/state/form.selectors';
import { Store } from '@ngrx/store';
import { FormState } from '../../../feature-form/state/form.state';
import { FormTreeHelpers } from '../../../feature-form/form-tree/form-tree-helpers';
import { AttributeListState } from '../state/attribute-list.state';

export class AttributeDataSource extends DataSource<any> {

  // Controls whether all or only the passport columns are visible.
  public columnController = new AttributelistColumnController();

  // The REST API params (layerName,filter,...) for retrieving the data.
  public params = new DatasourceParams();

  // The related feature types of the mainFeature
  public relatedFeatures = new Map<number, RelatedFeatureType>();

  public relatedLeftSides = new Map<number, string>();

  public relatedRightSides = new Map<number, string>();

  public uniqueMainFeatureIds = new Map<number, string[]>();

  // the clazz name for the mainFeature
  public mainFeatureClazzName = '';

  // Total number of rows.
  public totalNrOfRows = 0;

  // The loaded data rows (i.e. page).
  private rows: RowData[] = [];

  private checkedIds: number[] = [];

  private destroyed = new Subject();

  constructor(
    private attributeService: AttributeService,
    private valueService: ValueService,
    private attributelistService: AttributelistService,
    private tailorMapService: TailorMapService,
    private store$: Store<AttributeListState>,
  ) {
    super();
  }

  /**
   * Overrides the 'connect' method, so don't want to add a '$'!
   */
  // tslint:disable-next-line:rxjs-finnish
  public connect(): Observable<RowData[]> {
    // console.log('#AttributeDataSource - connect');
    return of(this.rows);
  }

  public disconnect(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public checkAll(): void {
    this.rows.forEach( (row: RowData) => { row._checked = true; } );
  }

  public checkNone(): void {
    this.rows.forEach( (row: RowData) => { row._checked = false; } );
  }

  /**
   * Returns the state of the checked rows.
   */
  public getCheckState(nrChecked: number): CheckState {
    // No checked rows?
    if (nrChecked === 0) {
      return CheckState.None;
    }
    // All rows are checked?
    if (nrChecked === this.rows.length) {
      return CheckState.All;
    } else {
      return CheckState.Some;
    }
  }

  /**
   * Returns the number of checked rows.
   */
  public getNrChecked(): number {
    let cnt = 0;
    this.rows.forEach( (row: RowData) => {
      if (row._checked) {
        cnt += 1;
      }
    });
    return cnt;
  }

  public getAllRowAsAttributeListFeature(onlyChecked?: boolean): AttributeListFeature[] {
    const features: AttributeListFeature[] = [];
    this.rows.forEach( (row: RowData) => {
      if (!onlyChecked || (onlyChecked && row._checked)) {
        features.push({
          features: row,
          related_featuretypes: row.related_featuretypes,
          __fid: row.__fid,
        });
      }
    });
    return features;
  }

  /**
   * Returns the checked Rows refactored to Features
   */
  public getCheckedRowsAsFeatures(): Feature[] {
    const feature = {} as Feature;
    const featuresChecked: Feature[] = [];
    this.rows.forEach( (row: RowData) => {
      if (row._checked) {
        const { object_guid, related_featuretypes, __fid, _checked, _details, _detailsRow, geometrie, ...rest } = row;
        if (row.geometrie) {
          rest.geometrie =  wellknown.parse(row.geometrie);
        }
        const appLayer = this.tailorMapService.getApplayerById(this.params.layerId);
        const className = LayerUtils.sanitizeLayername(appLayer);
        feature.children = [];
        feature.clazz = className;
        feature.objectGuid = row.object_guid;
        feature.relatedFeatureTypes = row.related_featuretypes;
        feature.objecttype = className[0].toUpperCase() + className.substr(1);
        featuresChecked.push({ ...feature, ...rest });
      }
    });
    return featuresChecked;
  }

  /**
   * Get relatedFeatures map as array
   */

  public getRelatedFeaturesAsArray(): RelatedFeatureType[] {
    const features = [];
    if (this.relatedFeatures.size > 0) {
      this.relatedFeatures.forEach((feature, key) => {
        features.push(feature);
      });
    }
    return features;
  }

  /**
   * sets all the rows checked
   */
  public setAllRowsChecked(): void {
    this.rows.forEach( (row: RowData) => {
        row._checked = true;
    });
  }

  /**
   * Sets the checked Rows based on features
   */
  public setCheckedRows (checkedFeatures: Feature[]) {
    this.rows.forEach( (row: RowData) => {
      if (checkedFeatures.find( feature => feature.objectGuid === row.object_guid) ) {
        this.checkedIds.push(row.object_guid);
      }
    })
  }

  public loadDataForAttributeTree$(pageSize: number): Observable<AttributelistNode> {
    // get columns
    const passportName = LayerUtils.sanitizeLayername(this.params.featureTypeName);
    let columnNames: string[] = [];
    // let response: AttributelistNode;
    this.store$.select(selectFormConfigs).subscribe(formConfigs => {
      const formConfig = formConfigs.get(passportName);
      if (formConfig && formConfig.fields) {
        columnNames = formConfig.fields.map(attr => attr.key);
      }
    });

    const attrParams: AttributeListParameters = {
      application: this.tailorMapService.getApplicationId(),
      appLayer: this.params.layerId,
      filter: this.params.valueFilter,
      limit: pageSize,
      page: 1,
      featureType: this.params.featureTypeId,
      start: 0,
      clearTotalCountCache: true,
    };
    return forkJoin([
      this.store$.select(selectFormConfigs).pipe(take(1), map(formConfigs => {
        const formConfig = formConfigs.get(passportName);
        if (formConfig && formConfig.fields) {
          columnNames = formConfig.fields.map(attr => attr.key);
        }
        return columnNames;
      })),
      this.attributeService.features$(attrParams),
    ]).pipe(map(([columns, response]) => {
      return {
        name: passportName,
        numberOfFeatures: response.total,
        features: response.features,
        columnNames: columns,
        isChild: true,
        params: attrParams,
      };
    }));
  }

  public loadTableData(attrTable: AttributelistTable, selectedTreeData: SelectedTreeData): void {
    if (selectedTreeData == null) {
      attrTable.onAfterLoadData();
      return;
    }
    this.columnController.setPassportColumnNames(selectedTreeData.columnNames);
    this.totalNrOfRows = selectedTreeData.numberOfFeatures;
    this.rows.splice(0, this.rows.length);
    selectedTreeData.features.forEach((feature) => {
      if (feature.features) {
        this.rows.push(feature.features);
      } else {
        this.rows.push(feature);
      }
    });
    this.getMetaData$().subscribe((result) => {
        const columnDefs: Attribute[] = this.metadataGetColumns('', result);
        this.columnController.setDataColumnNames(columnDefs);
        this.columnController.setAttributes(columnDefs);
      }, () => {},
      () => {
        // attrTable.onAfterLoadData();
        this.attributelistService.afterLoadRelatedData();
      });
  }

  private getMetadataParams(): AttributeMetadataParameters {
    const appId = this.tailorMapService.getApplicationId();

    // Set params for getting the metadata (contains main and detail metadata).
    const attrMetaParams: AttributeMetadataParameters = {
      application: appId,
      appLayer: this.params.layerId,
    };
    return attrMetaParams;
  }

  public getMetaData$(): Observable<AttributeMetadataResponse> {
   return this.attributeService.featureTypeMetadata$(this.getMetadataParams());
  }

  /**
   * Loads the data of a main or details table.
   */
  public loadData(
    attrTable: AttributelistTable,
    pageSize?: number,
    pageIndex?: number,
    sortedField?: string,
    sortDirection?: 'ASC' | 'DESC',
  ): void {

    // if (!this.params.hasDetail()) {
    //   console.log('#DataSource - loadData - ' + this.params.layerName);
    // } else {
    //   console.log('#DataSource - loadData - ' + this.params.featureTypeName);
    // }

    // Passport columns not yet loaded?
    if (!this.columnController.hasPassportColumns()) {
      let passportName = '';
      if (this.params.hasDetail()) {
        passportName = this.params.featureTypeName;
      } else {
        passportName = this.params.layerName;
      }
      // console.log('passportName: '+passportName);

      // Get passport field/column names.
      this.store$.select(selectFormConfigs).subscribe(formConfigs => {
        const formConfig = formConfigs.get(passportName);

        // FOR TESTING!!!
        // const formConfig = null;

        if (formConfig && formConfig.fields) {
          const columnNames = formConfig.fields.map(attr => attr.key);

          // FOR TESTING!!!
          // columnNames.push('xxx');

          // console.log(columnNames);
          this.columnController.setPassportColumnNames(columnNames);
        }
      });
    }

    // Get the app id.
    const appId = this.tailorMapService.getApplicationId();

    // Set params for getting the metadata (contains main and detail metadata).
    const attrMetaParams = this.getMetadataParams();

    // Set params for getting the actual data.
    const attrParams: AttributeListParameters = {
      application: appId,
      appLayer: this.params.layerId,
    };

    // TODO: onderstaande filters voor maintable en details zitten elkaar zo mogelijk in de weg.

    // Set filter on values in main table
    if (this.params.valueFilter) {
      attrParams.filter = this.params.valueFilter;
    }

    // Set details params.
    if (this.params.hasDetail()) {
      attrParams.featureType = this.params.featureTypeId;
      if (attrParams.filter) {
        attrParams.filter += ' AND (' + this.params.featureFilter + ')';
      } else {
        attrParams.filter = this.params.featureFilter;
      }
    } else {

    }

    // Set paging params.
    if (typeof pageSize !== 'undefined' && typeof pageIndex !== 'undefined') {
      attrParams.limit = pageSize;
      attrParams.page = 1;
      attrParams.start = pageIndex * pageSize;
    } else {
      attrParams.limit = -1;
      attrParams.page = 1;
      attrParams.start = 0;
    }
    attrParams.clearTotalCountCache = true;
    // Set sorting params.
    attrParams.dir = sortDirection || 'ASC';
    attrParams.sort = sortedField || '';

    // Remove all rows.
    this.rows.splice(0, this.rows.length);

    // Get the metadata, i.e. the columns.
    this.attributeService.featureTypeMetadata$(attrMetaParams)
      .subscribe(
        (metadata: AttributeMetadataResponse) => {

          // console.log(metadata);

          // Not already loaded?
          if (!this.columnController.hasDataColumns()) {
            // Extract column names from the metadata.
            let prefix = '';
            if (this.params.hasDetail()) {
              prefix = this.params.featureTypeName;
            } else {
              prefix = this.params.layerName;
            }
            // const columnNames: string[] =
            //   this.metadataGetColumnNames(prefix, metadata);

            const columnDefs: Attribute[] =
              this.metadataGetColumns(prefix, metadata);

            // console.log(columnDefs);

            // And set as initial column names and attributes
            // TODO: combine these methods?
            this.columnController.setDataColumnNames(columnDefs);
            this.columnController.setAttributes(columnDefs);

            metadata.relations.forEach(relation => {
              relation.relationKeys.forEach(key => {
                this.relatedLeftSides.set(relation.foreignFeatureType, key.leftSideName);
                this.relatedRightSides.set(relation.foreignFeatureType, key.rightSideName);
              });
            })
          }

          const valueParams: ValueParameters = {
            applicationLayer: this.params.layerId,
            attributes: [],
            maxFeatures: -1,
          };
          if (attrParams.filter) {
            valueParams.filter = attrParams.filter;
          }
          if (!this.params.hasDetail()) {
            this.relatedLeftSides.forEach((leftside, key) => {
              valueParams.attributes = [];
              valueParams.attributes.push(leftside);
              this.valueService.uniqueValues$(valueParams).subscribe((data) => {
                this.uniqueMainFeatureIds.set(key, data.uniqueValues[leftside]);
              });
            });
          }


          // Get the features.
          this.attributeService.features$(attrParams).subscribe(
            (data: AttributeListResponse) => {

              // if (this.params.hasDetail()) {
              //   console.log(data);
              // }

              if (data.success) {
                this.totalNrOfRows = data.total;

                // console.log(data.features[0]);
                // console.log(data.features[0].related_featuretypes);
                // // ### DEBUG --- SET FIRST ROW WITH NO DETAILS!!!
                // data.features[0].related_featuretypes = [];

                let passportName = '';
                if (this.params.hasDetail()) {
                  passportName = LayerUtils.sanitizeLayername(this.params.featureTypeName);
                } else {
                  passportName = this.params.layerName;
                  const appLayer = this.tailorMapService.getApplayerById(this.params.layerId);
                  this.mainFeatureClazzName = LayerUtils.sanitizeLayername(appLayer);
                }

                this.store$.select(selectFormConfigForFeatureType, passportName)
                  .pipe(takeUntil(this.destroyed))
                  .subscribe(formConfig => {
                    data.features.forEach(d => {
                      // console.log(d);
                      // console.log(d.related_featuretypes);

                      // Main data?
                      if (!this.params.hasDetail()) {
                        // Add property _checked
                        if (this.checkedIds.find(id => id === d.object_guid)) {
                          d._checked = true;
                        } else {
                          d._checked = false;
                        }
                        // Add property related_featuretypes if not exists.
                        if (!d.hasOwnProperty('related_featuretypes')) {
                          d.related_featuretypes = [];
                        }
                        // Add property _details and set initial state.
                        if (d.related_featuretypes.length > 0) {
                          d._details = DetailsState.YesCollapsed;
                          d.related_featuretypes.forEach((rel) => {
                            this.relatedFeatures.set(rel.id, rel);
                          });
                        } else {
                          d._details = DetailsState.No;
                        }
                      }
                      d = this.processRow(d, formConfig);

                      this.rows.push(d);
                    });

                  });
              }
            },
            () => {},
            () => {
              // reset checkbox for reload
              this.checkedIds = [];
              // Update the table.
              attrTable.onAfterLoadData();
            },
          );
        },
      );
  }

  private processRow(feat: AttributeListFeature, formConfig: FormConfiguration): AttributeListFeature {
    if (formConfig == null) {
      return feat;
    }

    const newFeat: AttributeListFeature = {
      __fid: feat.__fid,
      related_featuretypes: feat.related_featuretypes,
      ...feat,
    };
    formConfig.fields.forEach(field => {
      newFeat[field.key] = FormTreeHelpers.getFeatureValueForField(newFeat, formConfig, field.key);
    });
    return newFeat;
  }

  /**
   * Uses the attribute longname to get the proper column name starting with the prefix.
   */
  private metadataGetColumns(prefix: string, metadata: AttributeMetadataResponse): Attribute[] {
    if (!metadata.success) {
      return [];
    }
    const columns = [];
    prefix += '.';

    let featureType = -1;
    if (this.params.hasDetail()) {
      // Set detail feature type.
      featureType = this.params.featureTypeId
    } else {
      // Set master feature type for no related columns.
      featureType = metadata.featureType;
    }

    for (const attr of metadata.attributes) {
      // Check feature type.
      if (attr.featureType === featureType) {
        columns.push(attr);
      }
    }
    return columns;
  }

  /**
   * Reset the '_details' property to 'collapsed'.
   */
  public resetExpanded(): void {
    this.rows.forEach(row => {
      if (row._details === DetailsState.YesExpanded) {
        row._details = DetailsState.YesCollapsed;
      }
    })
  }

  /**
   * Toggles the '_checked' property.
   */
  public toggleChecked(row: RowData): void {
    row._checked = !row._checked;
  }
}
