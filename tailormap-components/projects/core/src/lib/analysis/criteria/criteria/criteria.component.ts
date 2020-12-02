import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../../state/analysis.state';
import { selectSelectedDataSource } from '../../state/analysis.selectors';
import {
  concatMap,
  map,
  takeUntil,
} from 'rxjs/operators';
import {
  forkJoin,
  Observable,
  of,
  Subject,
} from 'rxjs';
import { MetadataService } from '../../../application/services/metadata.service';
import {
  Attribute,
  AttributeMetadataResponse,
} from '../../../shared/attribute-service/attribute-models';
import { CriteriaSourceModel } from '../../models/criteria-source.model';

interface CriteriaFormData {
  source?: number;
  attribute?: string;
  condition?: string;
  value?: string;
}

@Component({
  selector: 'tailormap-criteria',
  templateUrl: './criteria.component.html',
  styleUrls: ['./criteria.component.css'],
})
export class CriteriaComponent implements OnInit, OnDestroy {

  private destroyed = new Subject();
  public availableSources: CriteriaSourceModel[];
  private allAttributes: Attribute[];
  public availableAttributes$: Observable<Attribute[]>;

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

  private formData: CriteriaFormData = {}

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

    this.criteriaForm.valueChanges.pipe(takeUntil(this.destroyed)).subscribe(formValues => {
        this.formData = {
          source: +(formValues.source),
          attribute: formValues.attribute,
          condition: formValues.condition,
          value: formValues.value,
        };
      });

    this.availableAttributes$ = this.criteriaForm.get('source').valueChanges.pipe(
      takeUntil(this.destroyed),
      map(selectedSource => {
        return this.allAttributes.filter(attribute => attribute.featureType === +(selectedSource));
      }));
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private setupFormValues(selectedDataSource: CriteriaSourceModel, layerMetadata: AttributeMetadataResponse) {
    const relationSources = layerMetadata.relations.map<CriteriaSourceModel>(relation => ({
      featureType: relation.foreignFeatureType,
      label: `${relation.foreignFeatureTypeName}`,
    }));
    this.availableSources = [
      {featureType: selectedDataSource.featureType, label: selectedDataSource.label},
      ...relationSources,
    ];
    this.allAttributes = layerMetadata.attributes;
  }

}
