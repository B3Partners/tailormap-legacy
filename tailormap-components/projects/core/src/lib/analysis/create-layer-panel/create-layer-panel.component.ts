import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { selectCreateLayerMode } from '../state/analysis.selectors';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { clearCreateLayerMode } from '../state/analysis.actions';

@Component({
  selector: 'tailormap-create-layer-panel',
  templateUrl: './create-layer-panel.component.html',
  styleUrls: ['./create-layer-panel.component.css'],
})
export class CreateLayerPanelComponent implements OnInit, OnDestroy {

  public createLayerEnum = CreateLayerModeEnum;
  public createLayerMode: CreateLayerModeEnum;
  public selectedTabIndex = 0;

  private destroyed = new Subject();

  constructor(
    private store$: Store<AnalysisState>,
  ) {}

  public ngOnInit() {
    this.store$.select(selectCreateLayerMode)
      .pipe(takeUntil(this.destroyed))
      .subscribe(createLayerMode => {
        this.createLayerMode = createLayerMode;
      });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public closePanel() {
    this.store$.dispatch(clearCreateLayerMode());
  }

  public moveToStyling() {
    this.selectedTabIndex = 1;
  }

}
