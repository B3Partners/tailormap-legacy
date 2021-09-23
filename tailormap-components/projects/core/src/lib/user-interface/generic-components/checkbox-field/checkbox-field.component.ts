import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FeatureAttribute } from '../../../feature-form/form/form-models';
import { FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'tailormap-checkbox-field',
  templateUrl: './checkbox-field.component.html',
  styleUrls: ['./checkbox-field.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFieldComponent {

  @Input()
  public groep: FormGroup;

  @Input()
  public attribute: FeatureAttribute;


  public checkboxValue(): boolean {
    if(this.attribute.value === null) {
      return false;
    }
    return this.attribute.value === this.attribute.valueTrue;
  }

  public onCheckboxChange(event: MatCheckboxChange): void {
    if (event.checked) {
      this.attribute.value = this.attribute.valueTrue;
      this.groep.get(this.attribute.key).setValue(this.attribute.valueTrue, {
        emitEvent: true,
        onlySelf: false,
        emitModelToViewChange: true,
        emitViewToModelChange: true,
      });
    } else {
      this.attribute.value = this.attribute.valueFalse;
      this.groep.get(this.attribute.key).setValue(this.attribute.valueFalse, {
        emitEvent: true,
        onlySelf: false,
        emitModelToViewChange: true,
        emitViewToModelChange: true,
      });
    }
  }

}
