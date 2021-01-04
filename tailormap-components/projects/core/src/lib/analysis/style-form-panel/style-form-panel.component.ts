import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { selectSelectedDataSource, selectSelectedStyleModel } from '../state/analysis.selectors';
import { combineLatest, Subject } from 'rxjs';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { StyleHelper } from '../helpers/style.helper';
import { setSelectedStyle, updateStyle } from '../state/analysis.actions';
import { takeUntil } from 'rxjs/operators';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { AttributeTypeHelper } from '../../application/helpers/attribute-type.helper';

@Component({
  selector: 'tailormap-style-form-panel',
  templateUrl: './style-form-panel.component.html',
  styleUrls: ['./style-form-panel.component.css'],
})
export class StyleFormPanelComponent implements OnInit, OnDestroy {

  public selectedStyleModel: UserLayerStyleModel;
  public selectedDataSource: AnalysisSourceModel;

  private destroyed = new Subject();

  constructor(private store$: Store<AnalysisState>) { }

  public ngOnInit() {
    combineLatest([
      this.store$.select(selectSelectedStyleModel),
      this.store$.select(selectSelectedDataSource),
    ]).pipe(takeUntil(this.destroyed)).subscribe(([ style, dataSource ]) => {
      this.selectedStyleModel = style;
      this.selectedDataSource = dataSource;
    });
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public getGeometryTypeLabel() {
    if (!this.selectedDataSource) {
      return '';
    }
    return AttributeTypeHelper.getLabelForAttributeType(this.selectedDataSource.geometryType);
  }

  public getStyleLabel(style: UserLayerStyleModel) {
    return StyleHelper.getStyleLabel(style);
  }

  public styleUpdated($event: UserLayerStyleModel) {
    const style: UserLayerStyleModel = {
      ...this.selectedStyleModel,
      ...$event,
    };
    this.store$.dispatch(updateStyle({ style }));
  }

  public closePanel() {
    this.store$.dispatch(setSelectedStyle({ styleId: null }));
  }

}
