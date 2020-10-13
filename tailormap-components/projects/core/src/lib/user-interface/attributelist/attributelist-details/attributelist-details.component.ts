import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

import { MatSort, Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

import { AttributelistTable } from '../attributelist-common/attributelist-models';
import { AttributeDataSource } from '../attributelist-common/attributelist-datasource';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { LayerService } from '../layer.service';
import { FormconfigRepositoryService } from '../../../shared/formconfig-repository/formconfig-repository.service';
import { RelatedFeatureType } from '../../test-attributeservice/models';

@Component({
  selector: 'tailormap-attributelist-details',
  templateUrl: './attributelist-details.component.html',
  styleUrls: ['./attributelist-details.component.css'],
})
// export class AttributelistDetailsComponent implements OnInit, AttributelistTable {
export class AttributelistDetailsComponent implements OnInit,
                                                      AttributelistTable,
                                                      AfterViewInit {

  @ViewChild(MatSort) private sort: MatSort;

  // Table reference for 'manually' rendering.
  @ViewChild('detailtable') public table: MatTable<any>;

  // The parent layer id for this detail table.
  @Input()
  public parentLayerId = -1;

  // The parent layer name for this detail table.
  @Input()
  public parentLayerName = '';

  // The parent row featuretype for this detail table.
  @Input()
  public featureType: RelatedFeatureType;

  public dataSource = new AttributeDataSource(this.layerService,
                                              this.attributeService,
    this.formconfigRepoService);

  constructor(private attributeService: AttributeService,
              private layerService: LayerService,
              private formconfigRepoService: FormconfigRepositoryService) {
    // console.log('#Details - constructor');
  }

  public ngOnInit(): void {
    // console.log('#Details - ngOnInit');
  }

  public ngAfterViewInit(): void {
    console.log('#Details - ngAfterViewInit');

    // Set datasource sort.
    this.dataSource.sorter = this.sort;

    // console.log(this.parentLayerId);
    // console.log(this.parentLayerName);
    // // console.log(featureType);
    // console.log(this.featureType.id);
    // console.log(this.featureType.foreignFeatureTypeName);
    // console.log(this.featureType.filter);

    // Set datasource params.
    this.dataSource.params.layerId = this.parentLayerId;
    this.dataSource.params.layerName = this.parentLayerName;
    this.dataSource.params.featureTypeId = this.featureType.id;
    this.dataSource.params.featureTypeName = this.featureType.foreignFeatureTypeName;
    this.dataSource.params.featureFilter = this.featureType.filter;

    // Update the table.
    this.updateTable();
  }

  /**
   * Renders the table rows after the data is loaded.
   */
  public onAfterLoadData(): void {
    // console.log('#Details - onAfterLoadData');
    // Update the table rows.
    this.table.renderRows();
  }

  /**
   * Return the column names. Do not include special column names.
   */
  public getColumnNames(): string[] {
    const columnNames = this.dataSource.columnController.getActiveColumnNames(false);
    // console.log(columnNames);
    return columnNames;
  }

  /**
   * Fired when a column header is clicked.
   */
  public onSortClick(sort: Sort): void {
    this.updateTable();
  }

  /**
   * (Re)loads the data, which fires the "onAfterLoadData" method.
   */
  private updateTable(): void {
    this.dataSource.loadData(this);
  }
}
