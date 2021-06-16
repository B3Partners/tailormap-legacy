import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Attribute, FeatureAttribute, FormFieldType } from '../form/form-models';
import { LinkedAttributeRegistryService } from '../linked-fields/registry/linked-attribute-registry.service';
import { FormFieldHelpers } from './form-field-helpers';
import { FormTreeHelpers } from '../form-tree/form-tree-helpers';
import { combineLatest, Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import { selectCurrentFeature, selectFormConfigForFeature } from '../state/form.selectors';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'tailormap-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.css'],
})
export class FormfieldComponent implements AfterViewInit, OnDestroy, OnInit {

  public humanReadableValue$: Observable<string>;

  @Output()
  public dateChange: EventEmitter< MatDatepickerInputEvent< any>>;

  @Input()
  public attribute: FeatureAttribute;

  @Input()
  public editing = false;

  @Input()
  public value: string;

  @Input()
  public groep: FormGroup;

  @Input()
  public isBulk: boolean;

  private control: AbstractControl;

  private destroyed = new Subject();

  constructor(
    private registry: LinkedAttributeRegistryService,
    private store$: Store<FormState>,
  ) {
  }

  public ngOnInit(): void {
    this.humanReadableValue$ = combineLatest([
      this.store$.select(selectCurrentFeature),
      this.store$.select(selectFormConfigForFeature),
    ])
      .pipe(
        filter(([feature, config]) => !!feature && !!config &&
          config.featureType === feature.clazz &&
          config.fields.find(field => field.key === this.attribute.key) !== undefined),
        takeUntil(this.destroyed),
        map(([feature, config]) => {
          return FormTreeHelpers.getFeatureValueForField(feature, config, this.attribute.key);
        }));
    }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public ngAfterViewInit(): void {
    this.control = this.groep.controls[this.attribute.key];
    if (!this.isBulk) {
      if (FormFieldHelpers.hasNonValidValue(this.attribute)) {
        this.control.setValidators([FormFieldHelpers.nonExistingValueValidator(this.attribute)]);
      } else {
        const comparableValue = FormFieldHelpers.getComparableValue(this.attribute);
        const value = comparableValue ? comparableValue.val : this.attribute.value;
        if (value) {
          this.control.setValue(value, {
            emitEvent: false,
            onlySelf: false,
            emitModelToViewChange: false,
            emitViewToModelChange: false,
          });
        }
      }
    }
  }

  public valueChanged(event: any): void {
    if (this.isDomainAttribute(this.attribute)) {
      this.registry.domainFieldChanged(this.attribute, event.value);
      this.registry.parentValue$.pipe(take(1)).subscribe((parentAttribute) => {
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

  public checkboxValue(): boolean {
    if(this.attribute.value === null) {
      return false;
    }
    return this.attribute.value === this.attribute.valueTrue;
  }

  public onCheckboxChange(event: any): void {
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

  public hasNonValidValue(): boolean {
    return FormFieldHelpers.hasNonValidValue(this.attribute);
  }

  public isTextAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.TEXTFIELD;
  public isSelectAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.SELECT;
  public isHiddenAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HIDDEN;
  public isDomainAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.DOMAIN;
  public isHyperlinkAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HYPERLINK;
  public isCheckboxAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.CHECKBOX;
  public isDateAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.DATE;

}
