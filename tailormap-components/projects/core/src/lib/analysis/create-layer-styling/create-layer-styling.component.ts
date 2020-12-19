import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  clearCreateLayerMode,
  setStyle,
} from '../state/analysis.actions';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import {
  selectCanCreateLayer,
  selectIsCreatingLayer,
  selectSelectedDataSource,
  selectStyle,
} from '../state/analysis.selectors';
import { takeUntil } from 'rxjs/operators';
import {
  Observable,
  Subject,
} from 'rxjs';
import { UserLayerService } from '../services/user-layer.service';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { AttributeTypeHelper } from '../../application/helpers/attribute-type.helper';
import { MatSliderChange } from '@angular/material/slider';
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
  public visible$: Observable<boolean>;

  public style: UserLayerStyleModel;
  private defaultStyle: UserLayerStyleModel = {
    fillOpacity: 100,
    fillColor: 'rgb(255, 105, 105)',
    strokeColor: 'rgb(255, 105, 105)',
    strokeOpacity: 100,
    strokeWidth: 2,
    marker: 'circle',
    markerSize: 8,
    markerFillColor: 'rgb(255, 105, 105)',
    markerStrokeColor: 'rgb(30, 30, 30)',
  };

  public availableMarkers = [
    { value: 'circle', icon: 'markers_circle' },
    { value: 'square', icon: 'markers_square' },
    { value: 'triangle', icon: 'markers_triangle' },
    { value: 'arrow', icon: 'markers_arrow' },
    { value: 'cross', icon: 'markers_cross' },
    { value: 'star', icon: 'markers_star' },
  ];

  private destroyed = new Subject();
  private debounce: number;
  private updatedProps: Map<keyof UserLayerStyleModel, string | number> = new Map();

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
    this.store$.select(selectStyle).pipe(takeUntil(this.destroyed)).subscribe(style => {
      this.style = style || this.defaultStyle;
    });
    this.store$.select(selectSelectedDataSource).pipe(takeUntil(this.destroyed)).subscribe(selectedDataSource => {
      this.selectedDataSource = selectedDataSource;
    });
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

  public showLineSettings() {
    return StyleHelper.showLineSettings(this.selectedDataSource);
  }

  public showPolygonSettings() {
    return StyleHelper.showPolygonSettings(this.selectedDataSource);
  }

  public showPointSettings() {
    return StyleHelper.showPointSettings(this.selectedDataSource);
  }

  public formatThumb(value: number) {
    return `${Math.round(value)}%`;
  }

  public getStrokeOpacity() {
    return this.style.strokeOpacity;
  }

  public changeStrokeColor($event: string) {
    this.change('strokeColor', $event);
    if (!this.showPolygonSettings()) {
      this.change('fillColor', $event);
    }
  }

  public changeMarkerFill($event: string) {
    this.change('markerFillColor', $event);
  }

  public changeMarkerStroke($event: string) {
    this.change('markerStrokeColor', $event);
  }

  public changeMarkerSize($event: MatSliderChange) {
    this.change('markerSize', $event.value);
  }

  public changeStrokeOpacity($event: MatSliderChange) {
    this.change('strokeOpacity', $event.value);
  }

  public changeStrokeWidth($event: MatSliderChange) {
    this.change('strokeWidth', $event.value);
  }

  public changeFillColor($event: string) {
    this.change('fillColor', $event);
  }

  public changeFillOpacity($event: MatSliderChange) {
    this.change('fillOpacity', $event.value);
  }

  public getMarkers() {
    return this.availableMarkers.map(m => m.icon);
  }

  public getSelectedMarker() {
    const marker = this.availableMarkers.find(m => m.value === this.style.marker);
    if (marker) {
      return marker.icon;
    }
    return '';
  }

  public changeMarker($event: string) {
    const marker = this.availableMarkers.find(m => m.icon === $event);
    if (marker) {
      this.change('marker', marker.value);
    }
  }

  private change(key: keyof UserLayerStyleModel, value: string | number) {
    this.updatedProps.set(key, value);
    if (this.debounce) {
      window.clearTimeout(this.debounce);
    }
    this.debounce = window.setTimeout(() => this.saveStyle(), 25);
  }

  private saveStyle() {
    let style = { ...this.style };
    this.updatedProps.forEach((value, key) => {
      style = { ...style, [key]: value };
    })
    this.store$.dispatch(setStyle({ style }));
    this.updatedProps.clear();
  }

}
