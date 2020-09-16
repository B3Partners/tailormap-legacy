/**============================================================================
 *===========================================================================*/

import { Component, OnInit, Input, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AttributelistPanelComponent } from '../attributelist-panel/attributelist-panel.component';

@Component({
  selector: 'tailormap-attributelist-form',
  templateUrl: './attributelist-form.component.html',
  styleUrls: ['./attributelist-form.component.css']
})
export class AttributelistFormComponent implements OnInit {

  // Show the attribute list panel as dialog or as div.
  showAsDialog = false;

  // Attribute list panel reference.
  @ViewChild("attrpanel") attrPanel: AttributelistPanelComponent;

  // Property/function to show the attribute list panel (caution: lowercase!).
  @Input()
  public set showwindow(value: any) {
    this.doShowWindow();
  }

  /**----------------------------------------------------------------------------
   */
  constructor(private dialog: MatDialog) {
  }
  /**----------------------------------------------------------------------------
   */
  ngOnInit(): void {
    // Show window/panel on init.
    //this.doShowWindow();
  }
  /**----------------------------------------------------------------------------
   */
  doShowWindow(): void {
    if (this.showAsDialog) {
      const config = {};
      const dlg = this.dialog.open(AttributelistPanelComponent, config);
      dlg.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    } else {
      this.attrPanel.show(true);
    }
  }
}
