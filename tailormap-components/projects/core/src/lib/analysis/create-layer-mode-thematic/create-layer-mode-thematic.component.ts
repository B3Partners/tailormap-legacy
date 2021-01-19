import { Component, OnDestroy, OnInit } from '@angular/core';
import { selectSelectedThematicAttribute, selectSelectedDataSource } from '../state/analysis.selectors';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { Subject } from 'rxjs';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';
import { map, takeUntil } from 'rxjs/operators';
import { loadThematicStyles, setSelectedThematicAttribute } from '../state/analysis.actions';
import { PassportAttributeModel } from '../../application/models/passport-attribute.model';

@Component({
  selector: 'tailormap-create-layer-mode-thematic',
  templateUrl: './create-layer-mode-thematic.component.html',
  styleUrls: ['./create-layer-mode-thematic.component.css'],
})
export class CreateLayerModeThematicComponent implements OnInit, OnDestroy {

  public selectedDataSource: AnalysisSourceModel;
  public selectedAttribute: string;
  private destroyed = new Subject();

  constructor(
    private store$: Store<AnalysisState>,
  ) { }

  public ngOnInit(): void {
    this.store$.select(selectSelectedDataSource).pipe(takeUntil(this.destroyed))
      .subscribe(selectedDataSource => {
        if (this.selectedDataSource && this.selectedDataSource.featureType !== selectedDataSource.featureType) {
          this.store$.dispatch(setSelectedThematicAttribute({ attribute: null }));
        }
        this.selectedDataSource = selectedDataSource;
      });
    this.store$.select(selectSelectedThematicAttribute)
      .pipe(
        takeUntil(this.destroyed),
        map(attribute => attribute ? attribute.name : ''),
      )
      .subscribe(attribute => this.selectedAttribute = attribute);
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public attributeSelected($event: { attribute: PassportAttributeModel; attributeType: AttributeTypeEnum }) {
    if (this.selectedAttribute === $event.attribute.name) {
      return;
    }
    this.store$.dispatch(setSelectedThematicAttribute({ attribute: $event.attribute }));
    this.store$.dispatch(loadThematicStyles({ attribute: $event.attribute, appLayer: this.selectedDataSource.layerId }));
  }

}
