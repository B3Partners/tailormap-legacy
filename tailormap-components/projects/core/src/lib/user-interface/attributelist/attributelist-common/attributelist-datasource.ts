/**
 * Remarks:
 * - Add an extra '_checked' column to the rows.
 */

import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

import { AttributelistParams } from './attributelist-params';
import { AttributelistTable } from './attributelist-models';
import { AttributelistColumnController } from './attributelist-column-controller';
import { AttributelistHelpers } from './attributelist-helpers';
import { AttributelistTableComponent } from '../attributelist-table/attributelist-table.component';
import { CheckState, DetailsState } from './attributelist-enums';

import { PassportService } from '../passport.service';
import { LayerService } from '../layer.service';
//import { AttributeService } from '../attribute.service';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { AttributeListParameters, AttributeListResponse,
         AttributeMetadataParameters, AttributeMetadataResponse } from '../../test-attributeservice/models';

export class AttributeDataSource extends DataSource<any> {

  public columnController = new AttributelistColumnController();

  // The REST API params (layerName,filter,...) for retrieving the data.
  public params = new AttributelistParams();

  // The paginator for paging.
  public paginator: MatPaginator;

  // The sorter for sorting.
  public sorter: MatSort;

  // Total number of rows.
  public totalNrOfRows = 0;

  // The loaded data rows (i.e. page).
  private rows: any[] = [];

  constructor(private layerService: LayerService,
              private attributeService: AttributeService,
              private passportService: PassportService) {
    super();
  }

  /**
   * Override the connect method.
   */
  // tslint:disable-next-line:rxjs-finnish
  public connect(): Observable<any[]> {
    console.log('-----------------------------');
    console.log('#AttributeDataSource - connect');
    return of(this.rows);
  }

  public disconnect(): void {
  }

  public addRow(row: any): void {
    this.rows.push(row);
  }

  public checkAll(): void {
    this.rows.forEach( (row: any) => { row._checked = true; } );
  }

  public checkNone(): void {
    this.rows.forEach( (row: any) => { row._checked = false; } );
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
    this.rows.forEach( (row: any) => {
      if (row._checked) {
        cnt += 1;
      }
    });
    return cnt;
  }

  /**
   * Loads the data.
   */
  public loadData(attrTable: AttributelistTable): void {

    console.log('#AttributeDataSource - loadData - ' + this.params.layerName);

    // Passport columns not yet loaded?
    if (!this.columnController.hasPassportColumns()) {
      // Get Passport column names.
      this.passportService.getColumnNames$(this.params.layerName).subscribe(
        (columnNames: string[]) => {
          // And set as initial column names.
          this.columnController.setPassportColumnNames(columnNames);
        },
      );
    }

    const appId = this.layerService.getAppId();
    const layerId = this.params.layerId;
    const featType = this.layerService.getFeatureType(layerId);

    const metaParams: AttributeMetadataParameters = {
      application: appId,
      appLayer: layerId,
    };

    console.log(this.paginator.pageSize);
    console.log(this.paginator.pageIndex);

    const params: AttributeListParameters = {
      application: appId,
      appLayer: layerId,
      featureType: featType,
      limit: this.paginator.pageSize,
      //page: this.paginator.pageIndex,   // TODO: Waar is deze voor?
      start: this.paginator.pageIndex,
    };

    // Set sorting params.
    params.dir = this.sorter.direction.toUpperCase();
    if (params.dir ==='') {
      params.dir = "ASC";
    }
    params.sort = this.sorter.active;
    if (params.sort === undefined) {
      params.sort = '';
    }
    //console.log(params)

    // Remove all rows.
    this.rows.splice(0, this.rows.length);

    // OK!
    // Add new rows.
    // this.attributeService.featureTypeMetadata$(metaParams).subscribe(
    //   (metaData: AttributeMetadataResponse) => {
    //     console.log(metaData);
    //     this.attributeService.features$(params).subscribe(
    //       (data: AttributeListResponse) => console.log(data)
    //     );
    //   }
    // );

    // Get the metadata, i.e. the columns.
    this.attributeService.featureTypeMetadata$(metaParams)
      .subscribe(
        (metadata: AttributeMetadataResponse) => {

          //console.log(metadata);

          // Not already loaded?
          if (!this.columnController.hasDataColumns()) {
            // Extract column names from the metadata.
            const columnNames: string[] = this.metadataGetColumnNames(metadata);

            console.log(columnNames);

            // And set as initial column names.
            this.columnController.setDataColumnNames(columnNames);
          }

          // Get the features.
          this.attributeService.features$(params).subscribe(
            (data: AttributeListResponse) => {
              //console.log(data);
              if (data.success) {
                this.totalNrOfRows = data.total;

                console.log(data.features[0]);
                console.log(data.features[0].related_featuretypes);
                // ### DEBUG !!!
                data.features[0].related_featuretypes = [];

                data.features.forEach(d => {
                  //console.log(d);
                  //console.log(d.related_featuretypes);

                  // Add property _checked.
                  d._checked = false;
                  // Add property related_featuretypes if not exists.
                  if (!d.hasOwnProperty('related_featuretypes')) {
                    d.related_featuretypes = [];
                  }
                  // Add property _details.
                  if (d.related_featuretypes.length > 0) {
                    d._details = DetailsState.YesCollapsed;
                  } else {
                    d._details = DetailsState.No;
                  }

                  // if (d.hasOwnProperty('related_featuretypes')) {
                  //   if (d.related_featuretypes.length > 0) {
                  //     d._details = DetailsState.YesCollapsed;
                  //   } else {
                  //     d._details = DetailsState.No;
                  //   }
                  // } else {
                  //   d._details = DetailsState.No;
                  // }
                  // if (d.related_featuretypes) {
                  //   d._details = DetailsState.YesCollapsed;
                  // } else {
                  //   d._details = DetailsState.No;
                  // }
                  this.rows.push(d);
                });
              }
            },
            () => {},
            () => {
              // console.log('loadData - competed');
              //console.log(this.rows);
              // Update the table.
              attrTable.onAfterLoadData();
            },
          );
          // // Get the features.
          // this.attributeService.features$(params).subscribe(
          //   (data: AttributeListResponse) => {
          //     //console.log(data);
          //     if (data.success) {
          //       this.totalNrOfRows = data.total;
          //       data.features.forEach(d => {
          //         this.rows.push(d);
          //       });
          //     }
          //   },
          //   () => {},
          //   () => {
          //     // console.log('loadData - competed');
          //     //console.log(this.rows);
          //     // Update the table.
          //     attrTable.onAfterLoadData();
          //   },
          // );
        }
      );
  }

  private metadataGetColumnNames(metadata: AttributeMetadataResponse): string[] {
    if (!metadata.success) {
      return [];
    }
    const colNames = [];
    for (const att of metadata.attributes) {
      colNames.push(att.name);
    }
    return colNames;
  }

  public toggleChecked(index: number): void {
    this.rows[index]._checked = !this.rows[index]._checked;
  }

  public toggleExpanded(row: any): void {
    if (row._details === DetailsState.YesCollapsed) {
      row._details = DetailsState.YesExpanded;
    } else if (row._details === DetailsState.YesExpanded) {
      row._details = DetailsState.YesCollapsed;
    };
  }
  // public toggleExpanded(index: number): void {
  //   console.log(index);
  //   if (this.rows[index]._details === DetailsState.YesCollapsed) {
  //     this.rows[index]._details = DetailsState.YesExpanded;
  //   } else if (this.rows[index]._details === DetailsState.YesExpanded) {
  //     this.rows[index]._details = DetailsState.YesCollapsed;
  //   };
  // }

}
