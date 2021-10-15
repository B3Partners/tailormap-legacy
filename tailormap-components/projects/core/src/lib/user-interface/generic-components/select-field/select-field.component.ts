import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Attribute, FeatureAttribute, FormFieldType } from '../../../feature-form/form/form-models';
import { FormGroup } from '@angular/forms';
import { LinkedAttributeRegistryService } from '../../../feature-form/linked-fields/registry/linked-attribute-registry.service';
import { take } from 'rxjs/operators';
import { FormFieldHelpers } from '../../../feature-form/form-field/form-field-helpers';

@Component({
  selector: 'tailormap-select-field',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectFieldComponent {

  @Input()
  public groep: FormGroup;

  @Input()
  public attribute: FeatureAttribute;

  @Input()
  public placeholder: string;

  constructor(
    private registry: LinkedAttributeRegistryService,
  ) {
  }

  public isDomainAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.DOMAIN;

  public valueChanged(event: any): void {
    if (this.isDomainAttribute(this.attribute)) {
      this.registry.domainFieldChanged(this.attribute, event.value);
      this.registry.parentValue$
        .pipe(take(1))
        .subscribe((parentAttribute) => {
          if(parentAttribute) {
            this.groep.get(parentAttribute.key).setValue(parentAttribute.value, {
              emitEvent: true,
              onlySelf: false,
              emitModelToViewChange: true,
              emitViewToModelChange: true,
            });
          }
        });
    }
  }

  public hasNonValidValue(): boolean {
    return FormFieldHelpers.hasNonValidValue(this.attribute);
  }

}
