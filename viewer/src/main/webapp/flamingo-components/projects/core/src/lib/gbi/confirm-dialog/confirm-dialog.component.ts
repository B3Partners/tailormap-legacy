import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

export interface ConfirmDialogData {
  title: string;
  message?: string;
  removeConfirm?: boolean;
}

@Component({
  selector: 'lcms-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {
  }

  public onConfirm(): void {
    this.dialogRef.close(true);
  }

  public onDismiss(): void {
    this.dialogRef.close(false);
  }

}
