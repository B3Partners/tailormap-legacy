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
    const value = event.checked ? this.attribute.valueTrue : this.attribute.valueFalse;
    this.attribute.value = value;
    this.groep.get(this.attribute.key).setValue(value, {
      emitEvent: true,
      onlySelf: false,
      emitModelToViewChange: true,
      emitViewToModelChange: true,
    });
    this.groep.get(this.attribute.key).markAsDirty({ onlySelf: true });
  }

}
