import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Attribute, FeatureAttribute, FormFieldType } from '../form/form-models';
import { LinkedAttributeRegistryService } from '../linked-fields/registry/linked-attribute-registry.service';
import { FormFieldHelpers } from './form-field-helpers';
import { FormTreeHelpers } from '../form-tree/form-tree-helpers';
import { combineLatest, Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { FormState } from '../state/form.state';
import { selectCurrentFeature, selectFormConfigForFeature } from '../state/form.selectors';
import { filter, map, takeUntil } from 'rxjs/operators';
import { LayerUtils } from '../../shared/layer-utils/layer-utils.service';

@Component({
  selector: 'tailormap-formfield',
  templateUrl: './formfield.component.html',
  styleUrls: ['./formfield.component.css'],
})
export class FormfieldComponent implements AfterViewInit, OnDestroy {

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
        if (comparableValue) {
          const val = comparableValue.val;
          this.control.setValue(val, {
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
    }
  }

  public hasNonValidValue(): boolean {
    return FormFieldHelpers.hasNonValidValue(this.attribute);
  }

  public humanReadableValue$(): Observable<string> {
    return combineLatest([
      this.store$.select(selectCurrentFeature),
      this.store$.select(selectFormConfigForFeature),
    ])
      .pipe(
        filter(([feature, config]) => !!feature && !!config &&
          LayerUtils.sanitizeLayername(config.featureType) === feature.clazz && feature[this.attribute.key]),
        takeUntil(this.destroyed),
        map(([feature, config]) => {
          return FormTreeHelpers.getFeatureValueForField(feature, config, this.attribute.key);
        }));
  }

  public isTextAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.TEXTFIELD;
  public isSelectAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.SELECT;
  public isHiddenAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HIDDEN;
  public isDomainAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.DOMAIN;
  public isHyperlinkAttribute = (attr: Attribute): boolean => attr.type === FormFieldType.HYPERLINK;

}
