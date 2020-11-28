import {
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { clearCreateLayerMode } from '../state/analysis.actions';
import { OverlayService } from '../../shared/overlay-service/overlay.service';
import { selectApplicationTree } from '../../application/state/application.selectors';
import { take } from 'rxjs/operators';
import { CreateLayerLayerSelectionComponent } from '../create-layer-layer-selection/create-layer-layer-selection.component';

@Component({
  selector: 'tailormap-create-layer-form',
  templateUrl: './create-layer-form.component.html',
  styleUrls: ['./create-layer-form.component.css'],
})
export class CreateLayerFormComponent implements OnInit {

  @Output()
  public next = new EventEmitter();

  public layerName = new FormControl('');

  constructor(
    private store$: Store<AnalysisState>,
    private overlay: OverlayService,
  ) {}

  public ngOnInit() {
  }

  public cancelCreateLayer() {
    this.store$.dispatch(clearCreateLayerMode());
  }

  public showSidePanel() {
    this.store$.select(selectApplicationTree)
      .pipe(take(1))
      .subscribe(tree => {
        CreateLayerLayerSelectionComponent.open(this.overlay, {
          tree,
        });
      })
  }

}
