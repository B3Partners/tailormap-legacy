import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import {
  selectCreateCriteriaMode,
  selectCreateLayerMode,
  selectIsSelectingDataSource,
} from '../state/analysis.selectors';
import { CreateLayerModeEnum } from '../models/create-layer-mode.enum';
import {
  Observable,
  Subject,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { clearCreateLayerMode } from '../state/analysis.actions';
import { CriteriaTypeEnum } from '../models/criteria-type.enum';

@Component({
  selector: 'tailormap-create-layer-panel',
  templateUrl: './create-layer-panel.component.html',
  styleUrls: ['./create-layer-panel.component.css'],
})
export class CreateLayerPanelComponent implements OnInit, OnDestroy {

  public createLayerEnum = CreateLayerModeEnum;
  public createLayerMode: CreateLayerModeEnum;
  public selectedTabIndex = 0;

  public isSelectingDataSource$: Observable<boolean>;
  public criteriaMode: CriteriaTypeEnum;

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
    this.store$.select(selectCreateCriteriaMode)
      .pipe(takeUntil(this.destroyed))
      .subscribe(criteriaMode => {
        this.criteriaMode = criteriaMode;
      });
    this.isSelectingDataSource$ = this.store$.select(selectIsSelectingDataSource);
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
