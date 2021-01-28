import { Component, OnInit, Inject, ElementRef } from '@angular/core';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AttributelistColumnController } from '../attributelist-common/attributelist-column-controller';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';

@Component({
  selector: 'tailormap-attributelist-table-options-form',
  templateUrl: './attributelist-table-options-form.component.html',
  styleUrls: ['./attributelist-table-options-form.component.css'],
})
export class AttributelistTableOptionsFormComponent implements OnInit {

  public columns: AttributeListColumnModel[];
  // Dit helpt niet.
  // @Input('cdkDragPreviewClass')
  // previewClass: string;

  private triggerElementRef: ElementRef;
  private columnController: AttributelistColumnController;

  constructor(private dialogRef: MatDialogRef<AttributelistTableOptionsFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.triggerElementRef = data.trigger;
    this.columnController = data.columnController;
    // Get active passport columns or if no passport all columns.
    this.columns = this.columnController.getActiveColumns(false);
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
  }
  public onActionsClick(): void {
    this.dialogRef.close(this.columns);
  }
  public isPassportActive(): boolean {
    return this.columnController.isPassportActive;
  }
  /**
   * Shows all or passport columns.
   */
  public onButtonClick(): void {
    if (this.columnController.isPassportActive) {
      // Set to all columns.
      this.columnController.setActiveAll();
    } else {
      // Set to passport columns.
      this.columnController.setActivePassport();
    }
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
  }
  public onTitleClick(): void {
    this.dialogRef.close(this.columns);
  }
}
