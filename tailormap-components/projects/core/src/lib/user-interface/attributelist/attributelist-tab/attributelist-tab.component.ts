/**
 * Remarks: a tab is created for each layer discovered in the layers property
 *          of the panel.
 */

import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { RowClickData } from '../attributelist-common/attributelist-models';

@Component({
  selector: 'tailormap-attributelist-tab',
  templateUrl: './attributelist-tab.component.html',
  styleUrls: ['./attributelist-tab.component.css'],
})
export class AttributelistTabComponent {

  @Input()
  public layerId: number;

  @Output()
  public pageChange = new EventEmitter();

  @Output()
  public rowClick = new EventEmitter<RowClickData>();

  @ViewChild('toolbar') public toolbar;

  @ViewChild('table') public table;

  constructor() {}

  // public ngOnInit(): void {
  // @TODO: replace by state actions
  //   // When a tab is initialized the tab index can be registered with
  //   // the layer service.
  //   // console.log('tab.comp ngOnInit: ' + this.tabIndex);
  //   this.layerService.registerTabComponent(this.tabIndex, this);
  // }

  public onPageChange(): void {
    this.pageChange.emit();
  }

  public onRowClick(data: RowClickData): void {
    this.rowClick.emit(data);
  }

}
