import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { DialogData } from '../form-popup/form-popup-models';

@Component({
  selector: 'flamingo-form-copy',
  templateUrl: './form-copy.component.html',
  styleUrls: ['./form-copy.component.css']
})
export class FormCopyComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FormCopyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,) { }

  ngOnInit(): void {
  }

}
