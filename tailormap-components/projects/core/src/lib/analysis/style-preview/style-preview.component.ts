import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { selectSelectedDataSource, selectStyles } from '../state/analysis.selectors';
import { Observable, Subject } from 'rxjs';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { takeUntil } from 'rxjs/operators';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { StyleHelper } from '../helpers/style.helper';

@Component({
  selector: 'tailormap-style-preview',
  templateUrl: './style-preview.component.html',
  styleUrls: ['./style-preview.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StylePreviewComponent implements OnInit, OnDestroy {

  private destroyed = new Subject();
  private selectedDataSource: AnalysisSourceModel;
  private availableMarkers = StyleHelper.getMarkerDictionary();

  public styles$: Observable<UserLayerStyleModel[]>;
  public trackByStyleId = style => style.id;

  constructor(
    private store$: Store<AnalysisState>,
  ) { }

  public ngOnInit(): void {
    this.styles$ = this.store$.select(selectStyles);
    this.store$.select(selectSelectedDataSource)
      .pipe(takeUntil(this.destroyed))
      .subscribe(selectedDataSource => this.selectedDataSource = selectedDataSource);
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public showPolygonStyle() {
    return StyleHelper.showPolygonSettings(this.selectedDataSource.geometryType);
  }

  public showLineStyle() {
    return StyleHelper.showLineSettings(this.selectedDataSource.geometryType);
  }

  public showPointStyle() {
    return StyleHelper.showPointSettings(this.selectedDataSource.geometryType);
  }

  public getPercentage(opacity: number) {
    return `${opacity}%`;
  }

  public getIcon(style: UserLayerStyleModel) {
    return this.availableMarkers.get(style.marker);
  }

  public getIconStyle(style: UserLayerStyleModel) {
    const DEFAULT_MARKER_SIZE = 8;
    const MAX_MARKER_SIZE = 20;
    const ratio = 1 / (MAX_MARKER_SIZE - DEFAULT_MARKER_SIZE);
    const scale = style.markerSize > 8
      ? 0.3 + (style.markerSize * ratio) // 30% makes it look good
      : style.markerSize / 8;
    return [
      `fill: ${style.markerFillColor};`,
      `stroke: ${style.markerStrokeColor};`,
      `stroke-width: 0.5px;`,
      `transform: scale(${scale});`,
    ].join(' ');
  }

  public getStrokeWidth(strokeWidth: number) {
    return strokeWidth * 5; // 5x best resembles the actual legend image
  }

}
