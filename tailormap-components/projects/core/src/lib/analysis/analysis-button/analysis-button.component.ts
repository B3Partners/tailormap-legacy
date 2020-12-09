import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { setCreateLayerMode } from '../state/analysis.actions';

@Component({
  selector: 'tailormap-analysis-button',
  templateUrl: './analysis-button.component.html',
  styleUrls: ['./analysis-button.component.css'],
})
export class AnalysisButtonComponent {

  public CREATE_LAYER_MODE = {
    BUFFER: CreateLayerModeEnum.BUFFER,
    SPATIAL: CreateLayerModeEnum.SPATIAL,
    ATTRIBUTES: CreateLayerModeEnum.ATTRIBUTES,
    THEMATIC: CreateLayerModeEnum.THEMATIC,
    REGIONAL: CreateLayerModeEnum.REGIONAL,
  }

  constructor(
    private store$: Store<AnalysisState>,
  ) {}

  public setCreateLayerMode(mode: CreateLayerModeEnum) {
    this.store$.dispatch(setCreateLayerMode({ createLayerMode: mode }));
  }

}
