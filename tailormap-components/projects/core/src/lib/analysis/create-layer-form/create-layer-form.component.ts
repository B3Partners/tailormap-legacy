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
  ) {}

  public ngOnInit() {
  }

  public cancelCreateLayer() {
    this.store$.dispatch(clearCreateLayerMode());
  }

  public showSidePanel() {
    return false;
  }

}
