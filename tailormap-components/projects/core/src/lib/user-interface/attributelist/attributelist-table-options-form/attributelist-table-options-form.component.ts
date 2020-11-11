/**
 * Remarks: The dialog has been opened in: table.onTableOptionsClick.
 *
 * https://material.angular.io/components/dialog/examples
 * https://www.material.io/components/dialogs#anatomy
 * https://www.techiediaries.com/angular-material-dialogs/   !!!!!!!!!!!!!
 */

import { Component, OnInit, Inject, ElementRef } from '@angular/core';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AttributelistColumnController } from '../attributelist-common/attributelist-column-controller';
import { AttributelistColumn } from '../attributelist-common/attributelist-column-models';
import { AttributelistColumnsService } from '../attributelist-common/attributelist-columns.service';

@Component({
  selector: 'tailormap-attributelist-table-options-form',
  templateUrl: './attributelist-table-options-form.component.html',
  styleUrls: ['./attributelist-table-options-form.component.css'],
})
export class AttributelistTableOptionsFormComponent implements OnInit {

  public columns: AttributelistColumn[];
  // Dit helpt niet.
  // @Input('cdkDragPreviewClass')
  // previewClass: string;

  private triggerElementRef: ElementRef;
  private columnController: AttributelistColumnController;

  // constructor(private elementRef: ElementRef,
  //             private renderer: Renderer2,
  //             private dialogRef: MatDialogRef<AttributelistTableOptionsFormComponent>,
  //             @Inject(MAT_DIALOG_DATA) public data: any) {
  constructor(private dialogRef: MatDialogRef<AttributelistTableOptionsFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private columnData: AttributelistColumnsService) {

    this.triggerElementRef = data.trigger;
    this.columnController = data.columnController;
    // Get active columns.
    this.columns = this.columnController.getActiveColumns(false);
    this.columnData.changeMessage(this.columns);
  }
  public ngOnInit(): void {
    let rect;
    if (this.triggerElementRef === null) {
      rect = {
        top: 100,
        left: 100,
        right: 150,
        bottom: 300,
      };
    } else {
      rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
    }
    // Update dialog position.
    const position = {left: `${rect.left}px`, top: `${rect.bottom - 50}px`};
    // console.log("#TableOptions - ngOnInit");
    // console.log(position);
    this.dialogRef.updatePosition(position);
    this.columnData.column$.subscribe(message => this.columns = message)
  }
  public onActionsClick(): void {
    this.dialogRef.close(this.columns);
  }
  /**
   * Shows all columns.
   */
  public onButtonClick(): void {
    // Set to all columns.
    this.columnController.setActiveAll();
  }
  public onDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
  /**
   * Fired when a checkbox is clicked.
   */
  public onRowCheckClick(index: number): void {
    // Toggle the checkbox in the checked row.
    this.columns[index].visible = !this.columns[index].visible;
    this.columnData.changeMessage(this.columns);
  }
  public onTitleClick(): void {
    this.dialogRef.close(this.columns);
  }
}
