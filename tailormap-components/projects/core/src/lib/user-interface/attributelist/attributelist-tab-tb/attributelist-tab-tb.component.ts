/**============================================================================
 *===========================================================================*/

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tailormap-attributelist-tab-tb',
  templateUrl: './attributelist-tab-tb.component.html',
  styleUrls: ['./attributelist-tab-tb.component.css']
})
export class AttributelistTabTbComponent implements OnInit {

  /**----------------------------------------------------------------------------
   */
  constructor() {
  }
  /**----------------------------------------------------------------------------
   */
  ngOnInit(): void {
  }
  /**----------------------------------------------------------------------------
   */
  onExportClick(format: string): void {
    alert("Not yet implemented.");
  }
  /**----------------------------------------------------------------------------
   */
  onFilterClick(): void {
    alert("Not yet implemented.");
  }
  /**----------------------------------------------------------------------------
   */
  onSearchClick(): void {
    alert("Not yet implemented.");
  }
}
