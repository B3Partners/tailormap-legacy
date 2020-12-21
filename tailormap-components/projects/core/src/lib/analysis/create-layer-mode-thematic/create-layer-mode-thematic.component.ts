import { Component, OnInit } from '@angular/core';
import { selectSelectedAttribute, selectSelectedDataSource } from '../state/analysis.selectors';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { Observable } from 'rxjs';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';
import { Attribute } from '../../shared/attribute-service/attribute-models';
import { map } from 'rxjs/operators';
import { setSelectedAttribute } from '../state/analysis.actions';

@Component({
  selector: 'tailormap-create-layer-mode-thematic',
  templateUrl: './create-layer-mode-thematic.component.html',
  styleUrls: ['./create-layer-mode-thematic.component.css'],
})
export class CreateLayerModeThematicComponent implements OnInit {

  public selectedDataSource$: Observable<AnalysisSourceModel>;
  public selectedAttribute$: Observable<string>;

  constructor(
    private store$: Store<AnalysisState>,
  ) { }

  public ngOnInit(): void {
    this.selectedDataSource$ = this.store$.select(selectSelectedDataSource);
    this.selectedAttribute$ = this.store$.select(selectSelectedAttribute)
      .pipe(map(attribute => attribute ? attribute.name : ''));
  }

  public attributeSelected($event: { attribute: Attribute; attributeType: AttributeTypeEnum }) {
    this.store$.dispatch(setSelectedAttribute({ attribute: $event.attribute }));
  }

}
