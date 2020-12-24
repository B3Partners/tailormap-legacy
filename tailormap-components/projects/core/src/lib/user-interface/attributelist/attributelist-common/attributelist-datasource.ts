/**
 * Datasource for the main table and details tables.
 *
 * Remarks:
 * - In case of the main table, adds an extra '_checked' column to the rows.
 * - In case of the main table, adds an extra '_details' column to the rows.
 */

import { DataSource } from '@angular/cdk/table';
import * as wellknown from 'wellknown';
import {
  Observable,
  of,
} from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

import {
  AttributelistTable,
  RowData,
} from './attributelist-models';
import { AttributelistColumnController } from './attributelist-column-controller';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import {
  Attribute,
  AttributeListFeature,
  AttributeListParameters,
  AttributeListResponse,
  AttributeMetadataParameters,
  AttributeMetadataResponse,
} from '../../../shared/attribute-service/attribute-models';
import {
  CheckState,
  DetailsState,
} from './attributelist-enums';
import { DatasourceParams } from './datasource-params';
import { Feature } from '../../../shared/generated';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { LayerService } from '../layer.service';
import { LayerUtils } from '../../../shared/layer-utils/layer-utils.service';
import {
  FormConfiguration,
  FormFieldType,
} from '../../../feature-form/form/form-models';
import { FormFieldHelpers } from '../../../feature-form/form-field/form-field-helpers';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';

export class AttributeDataSource extends DataSource<any> {

  // Controls whether all or only the passport columns are visible.
  public columnController = new AttributelistColumnController();

  // The REST API params (layerName,filter,...) for retrieving the data.
  public params = new DatasourceParams();

  // The paginator for paging.
  public paginator?: MatPaginator;

  // The sorter for sorting.
  public sorter: MatSort;

  // Total number of rows.
  public totalNrOfRows = 0;

  // The loaded data rows (i.e. page).
  private rows: RowData[] = [];

  private checkedIds: number[] = [];

  constructor(private layerService: LayerService,
              private attributeService: AttributeService,
              private tailorMapService: TailorMapService,
              private formconfigRepoService: FormconfigRepositoryService) {
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
   * Returns the associated layer id.
   */
  public getLayerId(): number {
    return this.params.layerId;
  }

  /**
   * Returns the associated layer name.
   */
  public getLayerName(): string {
    return this.params.layerName;
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
        feature.objecttype = className[0].toUpperCase() + className.substr(1);
        featuresChecked.push({ ...feature, ...rest });
      }
    });
    return featuresChecked;
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

  /**
   * Loads the data of a main or details table.
   */
  public loadData(attrTable: AttributelistTable): void {

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
      this.formconfigRepoService.formConfigs$.subscribe(formConfigs => {
        const formConfig = formConfigs.config[passportName];

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

    // if (this.paginator) {
    //   console.log(this.paginator.pageSize);
    //   console.log(this.paginator.pageIndex);
    // }

    // Get the app id.
    const appId = this.layerService.getAppId();

    // Set params for getting the metadata (contains main and detail metadata).
    const attrMetaParams: AttributeMetadataParameters = {
      application: appId,
      appLayer: this.params.layerId,
    };

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
      attrParams.filter = this.params.featureFilter;
    }

    // Set paging params.
    if (this.paginator) {
      attrParams.limit = this.paginator.pageSize;
      attrParams.page = 1;
      attrParams.start = this.paginator.pageIndex * this.paginator.pageSize;
    } else {
      attrParams.limit = 999;
      attrParams.page = 1;
      attrParams.start = 0;
    }

    // Set sorting params.
    attrParams.dir = this.sorter.direction.toUpperCase();
    if (attrParams.dir === '') {
      attrParams.dir = 'ASC';
    }
    attrParams.sort = this.sorter.active;
    if (attrParams.sort === undefined) {
      attrParams.sort = '';
    }

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

            // And set as initial column names.
            this.columnController.setDataColumnNames(columnDefs);
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
                  passportName = this.params.featureTypeName;
                } else {
                  passportName = this.params.layerName;
                }
                const formConfig = this.formconfigRepoService.getFormConfig(passportName);

                data.features.forEach(d => {
                  // console.log(d);
                  // console.log(d.related_featuretypes);

                  // Main data?
                  if (!this.params.hasDetail()) {
                    // Add property _checked
                    if (this.checkedIds.find ( id => id === d.object_guid)) {
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
                    } else {
                      d._details = DetailsState.No;
                    }
                  }
                  d = this.processRow(d, formConfig);

                  this.rows.push(d);
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
      if (field.type === FormFieldType.DOMAIN) {
        let value = feat[field.key] || '';

        field.options.forEach(option => {
          if ((FormFieldHelpers.isNumber(value) && option.val === parseInt( '' + value, 10))) {
            value = option.label;
          }
        });
        newFeat[field.key] = value;
      } else {
        newFeat[field.key] = feat[field.key];
      }
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
