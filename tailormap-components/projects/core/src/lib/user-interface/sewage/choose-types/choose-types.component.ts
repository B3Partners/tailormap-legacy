import {
  Component,
  NgZone,
  OnInit,
} from '@angular/core';
import {
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Choice } from '../../../workflow/workflows/WorkflowModels';

@Component({
  selector: 'tailormap-choose-types',
  templateUrl: './choose-types.component.html',
  styleUrls: ['./choose-types.component.css'],
})
export class ChooseTypesComponent implements OnInit {

  public form: FormGroup;

  constructor(public dialogRef: MatDialogRef<ChooseTypesComponent>,
              private formBuilder: FormBuilder,
              private ngZone: NgZone) {
  }

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      well1: ['rioolput', [Validators.required]],
      well2: ['rioolput', [Validators.required]],
      duct: ['mechleiding', [Validators.required]],
    })
  }

  public cancel() {
    const c: Choice = {
      cancelled: true,
    };
    this.closeDialog(c);
  }

  public next() {
    const c: Choice = {
      cancelled: false, duct: this.form.value.duct, well1: this.form.value.well1, well2: this.form.value.well2,
    };
    this.closeDialog(c);
  }

  public closeDialog(choice: Choice) {
    this.ngZone.run(() => {
      this.dialogRef.close(choice);
    });
  }
}
