import { Component, ElementRef, OnInit, AfterViewInit, Renderer2, ViewChild } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { AttributelistTable } from '../attributelist-common/attributelist-models';
import { CheckState, DetailsState } from '../attributelist-common/attributelist-enums';
import { AttributeDataSource } from '../attributelist-common/attributelist-datasource';
import { AttributelistColumn } from '../attributelist-common/attributelist-column-models';

//import { AttributeService } from '../attribute.service';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { AttributelistTableOptionsFormComponent } from '../attributelist-table-options-form/attributelist-table-options-form.component';
import { LayerService } from '../layer.service';
import { PassportService } from '../passport.service';

@Component({
  selector: 'tailormap-attributelist-details',
  templateUrl: './attributelist-details.component.html',
  styleUrls: ['./attributelist-details.component.css']
})
export class AttributelistDetailsComponent implements OnInit, AttributelistTable {

  @ViewChild(MatSort) private sort: MatSort;

  // Table reference for 'manually' rendering.
  @ViewChild('table') public table: MatTable<any>;

  public dataSource = new AttributeDataSource(this.layerService,
                                              this.attributeService,
                                              this.passportService);

  private tabIndex = -1;

  /**
   * Remark: The Renderer2 is needed for setting a custom css style.
   */
  constructor(private attributeService: AttributeService,
              private layerService: LayerService,
              private passportService: PassportService,
              private dialog: MatDialog,
              private renderer: Renderer2) {
    console.log('=============================');
    console.log('#Table - constructor');
  }

  public ngOnInit(): void {
    console.log('#Details - ngOnInit');
  }

  public ngAfterViewInit(): void {
    console.log('#Details - ngAfterViewInit');

    // Set datasource sort.
    this.dataSource.sorter = this.sort;
  }

  public onAfterLoadData(): void {
    console.log('#Details - onAfterLoadData');

    // Update the table rows.
    this.table.renderRows();
    // FOR TESTING. SHOW TABLE OPTIONS FORM AT STARTUP.
    // this.onTableOptionsClick(null);
  }

  public getColumnNames(): string[] {
    return this.dataSource.columnController.getActiveColumnNames(true);
  }

  public getColumnWidth(name: string): string {
    console.log("#Details - getColumnWidth - " + name);
    return '180px';
  }

  /**
   * Fired when a row is clicked.
   */
  public onRowClicked(row: any): void {
    console.log('#Details - onRowClicked');
    //console.log(row);
    // console.log('Checked: ' + row._checked.toString());
    // Toggle the expanded/collapsed state of the row.
    this.dataSource.toggleExpanded(row);
  }

  /**
   * Fired when a column header is clicked.
   */
  public onSortClick(sort: Sort): void {
    // console.log(`Table.onSort: ${sort.active} ${sort.direction}`);
    // Update the table.
    this.updateTable();
  }

  public setTabIndex(index: number): void {
    console.log('#Details - setTabIndex');
    // Set corresponding tab index.
    this.tabIndex = index;
    // Get layer.
    const layer = this.layerService.getLayerByTabIndex(this.tabIndex);
    console.log(layer);
    if (layer.name === '') {
      return;
    }
    // Set params layer name and id.
    this.dataSource.params.layerName = layer.name;
    this.dataSource.params.layerId = layer.id;
    // Update table.
    this.updateTable();
  }

  private updateTable(): void {
    // (Re)load data. Fires the onAfterLoadData method.
    this.dataSource.loadData(this);
  }

}
