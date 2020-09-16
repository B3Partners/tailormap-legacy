/**============================================================================
 *===========================================================================*/

import {Component, OnInit, AfterViewInit, Input, ViewChild} from '@angular/core';
import {LayerService} from '../layer.service';

@Component({
  selector: 'tailormap-attributelist-tab',
  templateUrl: './attributelist-tab.component.html',
  styleUrls: ['./attributelist-tab.component.css']
})
export class AttributelistTabComponent implements OnInit, AfterViewInit {

  // The index of the tab in the tabgroup/layers.
  @Input()
  tabIndex: number;

  @ViewChild("table") table;

  /**----------------------------------------------------------------------------
   */
  constructor(private layerService: LayerService) {
    // Init tab index.
    this.tabIndex = -1;
  }
  /**----------------------------------------------------------------------------
   */
  ngOnInit(): void {
    // Register this tab at the layer service.
    this.layerService.registerTabComponent(this.tabIndex, this);
  }
  /**----------------------------------------------------------------------------
   */
  ngAfterViewInit(): void {
    // Set table tab index (only here the table is defined).
    this.table.setTabIndex(this.tabIndex);
  }
}
