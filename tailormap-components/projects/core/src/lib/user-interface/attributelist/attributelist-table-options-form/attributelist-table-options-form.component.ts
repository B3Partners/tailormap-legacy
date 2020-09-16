/**============================================================================
 * Remarks: The dialog has been opened in: table.onTableOptionsClick.
 *
 * https://material.angular.io/components/dialog/examples
 * https://www.material.io/components/dialogs#anatomy
 * https://www.techiediaries.com/angular-material-dialogs/   !!!!!!!!!!!!!
 *===========================================================================*/

import { Component, OnInit, Inject, Input, ElementRef, Renderer2 } from '@angular/core';

import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {AttributelistColumnController} from '../attributelist-column-controller';
import {IAttributeListColumn} from '../attributelist-column-controller';
import { LayerService } from '../layer.service';
import { LayoutService } from '../../panel-resizer/layout.service';

@Component({
  selector: 'tailormap-attributelist-table-options-form',
  templateUrl: './attributelist-table-options-form.component.html',
  styleUrls: ['./attributelist-table-options-form.component.css']
})
export class AttributelistTableOptionsFormComponent implements OnInit {

  columns: IAttributeListColumn[];

  // Dit helpt niet.
  // @Input('cdkDragPreviewClass')
  // previewClass: string;

  private triggerElementRef: ElementRef;
  private columnController: AttributelistColumnController;

  /**----------------------------------------------------------------------------
   */
  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              private dialogRef: MatDialogRef<AttributelistTableOptionsFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.triggerElementRef = data.trigger;
    this.columnController = data.columnController;
    // Get active columns.
    this.columns = this.columnController.getActiveColumns(false);
  }
  /**----------------------------------------------------------------------------
   */
  ngOnInit(): void {
    // Set custom css style.
    this.setCustomStyle();

    // Dit helpt niet.
    //this.previewClass = "dragging";

    let rect;
    if (this.triggerElementRef === null) {
      rect = {
        top: 100,
        left: 100,
        right: 150,
        bottom: 300
      };
    } else {
      rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
    }

    // Update dialog position.
    const position = {left: `${rect.left}px`, top: `${rect.bottom - 50}px`};
    //console.log("#TableOptions - ngOnInit");
    //console.log(position);
    this.dialogRef.updatePosition(position);
  }
  /**----------------------------------------------------------------------------
   */
  onActionsClick(): void {
    this.dialogRef.close(this.columns);
  }
  /**----------------------------------------------------------------------------
   * Shows all columns.
   */
  onButtonClick(): void {
    // Set to all columns.
    this.columnController.setActiveAll();
  }
  /**----------------------------------------------------------------------------
   */
  onDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  /**----------------------------------------------------------------------------
   * Fired when a checkbox is clicked.
   */
  onRowCheckClick(index: number): void {
    // Toggle the checkbox in the checked row.
    this.columns[index].visible = !this.columns[index].visible;
  }
  /**----------------------------------------------------------------------------
   */
  onTitleClick(): void {
    this.dialogRef.close(this.columns);
  }
  /**----------------------------------------------------------------------------
   * Sets custom css style for dom elements which style cannot been set in
   * the css file.
   */
  setCustomStyle(): void {

    // Get parent dom element, i.e. the dialog container.
    const dlgDomElem = this.elementRef.nativeElement.parentElement;

    // Restyle the dialog.
    // Reduce the width of the white border. NEE, dit verklooit de dialog.
    //this.renderer.setStyle(dlgDomElem, 'padding', '12px');

    //this.renderer.setStyle(dlgDomElem, 'background', 'rgba(255,255,255,0.5');
    this.renderer.setStyle(dlgDomElem, 'overflow', 'hidden');
    this.renderer.setStyle(dlgDomElem, 'overflow-y', 'auto');

    //console.log(dlgDomElem);
  }
}
