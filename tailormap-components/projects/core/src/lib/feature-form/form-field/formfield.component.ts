import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Attribute, FeatureAttribute, FormFieldType } from '../form/form-models';
import { FormFieldHelpers } from './form-field-helpers';
import { FormTreeHelpers } from '../form-tree/form-tree-helpers';
import { combineLatest, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import { selectCurrentFeature, selectFormConfigForFeature } from '../state/form.selectors';
import { filter, map } from 'rxjs/operators';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'tailormap-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.css'],
})
export class FormfieldComponent implements AfterViewInit, OnInit {

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

  constructor(
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
          config.featureType === feature.tableName &&
          config.fields.find(field => field.key === this.attribute.key) !== undefined),
        map(([feature, config]) => {
          return FormTreeHelpers.getFeatureValueForField(feature, config, this.attribute.key);
        }));
    }

  public ngAfterViewInit(): void {
    this.control = this.groep.controls[this.attribute.key];
    if (!this.isBulk) {
      if (FormFieldHelpers.hasNonValidValue(this.attribute)) {
        this.control.setValidators([FormFieldHelpers.nonExistingValueValidator(this.attribute)]);
      } else {
        const comparableValue = FormFieldHelpers.findSelectedOption(this.attribute.options, this.attribute.value);
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

  public isTextAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.TEXTFIELD;
  public isSelectAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.SELECT;
  public isHiddenAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HIDDEN;
  public isDomainAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.DOMAIN;
  public isHyperlinkAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HYPERLINK;
  public isCheckboxAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.CHECKBOX;
  public isDateAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.DATE;

}
