import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { selectSelectedDataSource, selectStyles } from '../state/analysis.selectors';
import { Observable, Subject } from 'rxjs';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { takeUntil } from 'rxjs/operators';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { StyleHelper } from '../helpers/style.helper';
import { IconService } from '../../shared/icons/icon.service';

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
    private iconService: IconService,
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
    return this.iconService.getUrlForIcon(style.marker, 'markers');
  }

}
