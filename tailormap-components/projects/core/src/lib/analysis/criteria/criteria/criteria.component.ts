import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
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
import { AppLayer } from '../../../../../../bridge/typings';

interface AvailableSource {
  featureType: number;
  label: string;
}

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
  private availableSources: AvailableSource[];
  private allAttributes: Attribute[];
  private availableAttributes$: Observable<Attribute[]>;

  private criteriaForm = this.fb.group({
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
          return forkJoin([ of(selectedDataSource), this.metadataService.getFeatureTypeMetadata$(selectedDataSource.id) ])
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
      }),
    );
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private setupFormValues(selectedDataSource: AppLayer, layerMetadata: AttributeMetadataResponse) {
    const relationSources = layerMetadata.relations.map<AvailableSource>(relation => ({
      featureType: relation.foreignFeatureType,
      label: `${relation.foreignFeatureType}`,
    }));
    this.availableSources = [
      {featureType: selectedDataSource.featureType, label: selectedDataSource.alias},
      ...relationSources,
    ];
    this.allAttributes = layerMetadata.attributes;
  }

}
