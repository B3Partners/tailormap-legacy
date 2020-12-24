import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  clearCreateLayerMode, setSelectedStyle, setStyles, updateStyle,
} from '../state/analysis.actions';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import {
  selectCanCreateLayer,
  selectCreateLayerErrorMessage,
  selectIsCreatingLayer,
  selectSelectedDataSource,
  selectStyles,
} from '../state/analysis.selectors';
import { takeUntil } from 'rxjs/operators';
import {
  Observable,
  Subject,
} from 'rxjs';
import { UserLayerService } from '../services/user-layer.service';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { AttributeTypeHelper } from '../../application/helpers/attribute-type.helper';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { StyleHelper } from '../helpers/style.helper';

@Component({
  selector: 'tailormap-create-layer-styling',
  templateUrl: './create-layer-styling.component.html',
  styleUrls: ['./create-layer-styling.component.css'],
})
export class CreateLayerStylingComponent implements OnInit, OnDestroy {

  public canCreateLayer: boolean;
  public isCreatingLayer: boolean;
  public selectedDataSource: AnalysisSourceModel;

  public errorMessage$: Observable<string>;

  private destroyed = new Subject();
  public styles: UserLayerStyleModel[];

  constructor(
    private store$: Store<AnalysisState>,
    private userLayerService: UserLayerService,
  ) { }

  public ngOnInit(): void {
    this.store$.select(selectCanCreateLayer).pipe(takeUntil(this.destroyed)).subscribe(canCreateLayer => {
      this.canCreateLayer = canCreateLayer;
    });
    this.store$.select(selectIsCreatingLayer).pipe(takeUntil(this.destroyed)).subscribe(isCreatingLayer => {
      this.isCreatingLayer = isCreatingLayer;
    });
    this.store$.select(selectStyles).pipe(takeUntil(this.destroyed)).subscribe(styles => {
      this.styles = styles;
    });
    this.store$.select(selectSelectedDataSource).pipe(takeUntil(this.destroyed)).subscribe(selectedDataSource => {
      this.selectedDataSource = selectedDataSource;
    });
    this.errorMessage$ = this.store$.select(selectCreateLayerErrorMessage);
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public cancelCreateLayer() {
    this.store$.dispatch(clearCreateLayerMode());
  }

  public createLayer() {
    if (!this.canCreateLayer) {
      return;
    }
    this.userLayerService.createUserLayer();
  }

  public getGeometryTypeLabel() {
    return AttributeTypeHelper.getLabelForAttributeType(this.selectedDataSource.geometryType);
  }

  public hasSingleStyle() {
    return !!this.styles && this.styles.length === 1;
  }

  public hasMultipleStyles() {
    return !!this.styles && this.styles.length > 1;
  }

  public singleStyleUpdated($event: UserLayerStyleModel) {
    if (!this.hasSingleStyle()) {
      return;
    }
    const style: UserLayerStyleModel = {
      ...this.styles[0],
      ...$event,
    };
    this.store$.dispatch(updateStyle({ style }));
  }

  public toggleActive(style: UserLayerStyleModel) {
    const updatedStyle: UserLayerStyleModel = {
      ...style,
      active: !style.active,
    };
    this.store$.dispatch(updateStyle({ style: updatedStyle }));
  }

  public getStyleLabel(style: UserLayerStyleModel) {
    return StyleHelper.getStyleLabel(style);
  }

  public setSelectedStyle(style: UserLayerStyleModel) {
    this.store$.dispatch(setSelectedStyle({ styleId: style.id }));
  }

}
