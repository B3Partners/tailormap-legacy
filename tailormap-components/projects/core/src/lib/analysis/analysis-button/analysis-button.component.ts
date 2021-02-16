import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { setCreateLayerMode } from '../state/analysis.actions';
import { selectSelectedAppLayer } from '../../application/state/application.selectors';
import { Observable } from 'rxjs';
import { UserLayerService } from '../services/user-layer.service';
import { removeAppLayer } from '../../application/state/application.actions';
import { TailormapAppLayer } from '../../application/models/tailormap-app-layer.model';

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
  public selectedAppLayer$: Observable<TailormapAppLayer>;
  public isRemoving = false;

  constructor(
    private store$: Store<AnalysisState>,
    private userLayerService: UserLayerService,
  ) {
    this.selectedAppLayer$ = this.store$.select(selectSelectedAppLayer);
  }

  public setCreateLayerMode(mode: CreateLayerModeEnum) {
    this.store$.dispatch(setCreateLayerMode({ createLayerMode: mode }));
  }

  public removeLayer(selectedAppLayer: TailormapAppLayer) {
    if (this.isRemoving) {
      return;
    }
    this.isRemoving = true;
    this.userLayerService.removeLayer$(selectedAppLayer)
      .subscribe(result => {
        this.store$.dispatch(removeAppLayer({ layer: selectedAppLayer }));
        setTimeout(() => this.isRemoving = false, 250);
      });
  }

}
