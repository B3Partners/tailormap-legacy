import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormBuilder,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../../state/analysis.state';
import { selectSelectedDataSource } from '../../state/analysis.selectors';
import {
  concatMap,
  debounceTime,
  takeUntil,
} from 'rxjs/operators';
import {
  BehaviorSubject,
  forkJoin,
  of,
  Subject,
} from 'rxjs';
import { MetadataService } from '../../../application/services/metadata.service';
import {
  Attribute,
  AttributeMetadataResponse,
} from '../../../shared/attribute-service/attribute-models';
import { AnalysisSourceModel } from '../../models/analysis-source.model';
import { CriteriaConditionModel } from '../../models/criteria-condition.model';

@Component({
  selector: 'tailormap-criteria',
  templateUrl: './criteria.component.html',
  styleUrls: ['./criteria.component.css'],
})
export class CriteriaComponent implements OnInit, OnDestroy {

  @Input()
  public criteria?: CriteriaConditionModel;

  @Output()
  public criteriaChanged: EventEmitter<CriteriaConditionModel> = new EventEmitter<CriteriaConditionModel>();

  private destroyed = new Subject();
  public availableSources: AnalysisSourceModel[];
  private allAttributes: Attribute[];

  private availableAttributesSubject$ = new BehaviorSubject<Attribute[]>([]);
  public availableAttributes$ = this.availableAttributesSubject$.asObservable();

  public filterTypes = [
    { value: '=', label: 'Is gelijk aan' },
    { value: '>', label: 'Is groter dan' },
    { value: '<', label: 'Is kleiner dan' },
    { value: '>=', label: 'Is groter of gelijk aan' },
    { value: '<=', label: 'Is kleiner of gelijk aan0' },
    { value: 'contains', label: 'Bevat' },
  ];

  public criteriaForm = this.fb.group({
    source: [''],
    attribute: [''],
    condition: [''],
    value: [''],
  });

  private formData: CriteriaConditionModel = {}

  constructor(
    private fb: FormBuilder,
    private store$: Store<AnalysisState>,
    private metadataService: MetadataService,
  ) { }

  public ngOnInit(): void {
    this.store$.select(selectSelectedDataSource)
      .pipe(
        takeUntil(this.destroyed),
        concatMap(selectedDataSource => {
          return forkJoin([ of(selectedDataSource), this.metadataService.getFeatureTypeMetadata$(selectedDataSource.layerId) ])
        }),
      )
      .subscribe(([ selectedDataSource, layerMetadata ]) => {
        this.setupFormValues(selectedDataSource, layerMetadata);
      });

    this.criteriaForm.valueChanges
      .pipe(
        takeUntil(this.destroyed),
        debounceTime(250),
      )
      .subscribe(formValues => {
        const source = +(formValues.source);
        if (this.formData.source !== source) {
          this.availableAttributesSubject$.next(this.getAttributesForFeatureType(source));
        }
        this.formData = {
          source,
          attribute: formValues.attribute,
          condition: formValues.condition,
          value: formValues.value,
        };
        this.criteriaChanged.emit(this.formData);
      });

    if (this.criteria && this.criteria.source) {
      this.availableAttributesSubject$.next(this.getAttributesForFeatureType(this.criteria.source));
      this.criteriaForm.patchValue(this.criteria);
    }
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private setupFormValues(selectedDataSource: AnalysisSourceModel, layerMetadata: AttributeMetadataResponse) {
    const relationSources = layerMetadata.relations.map<AnalysisSourceModel>(relation => ({
      featureType: relation.foreignFeatureType,
      label: `${relation.foreignFeatureTypeName}`,
    }));
    this.availableSources = [
      {featureType: selectedDataSource.featureType, label: selectedDataSource.label},
      ...relationSources,
    ];
    this.allAttributes = layerMetadata.attributes;
  }

  private getAttributesForFeatureType(selectedSource: string | number) {
    return this.allAttributes.filter(attribute => attribute.featureType === +(selectedSource));
  }

}
