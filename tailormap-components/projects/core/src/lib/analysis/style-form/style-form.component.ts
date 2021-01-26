import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserLayerStyleModel } from '../models/user-layer-style.model';
import { StyleHelper } from '../helpers/style.helper';
import { MatSliderChange } from '@angular/material/slider';
import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';

@Component({
  selector: 'tailormap-style-form',
  templateUrl: './style-form.component.html',
  styleUrls: ['./style-form.component.css'],
})
export class StyleFormComponent implements OnInit {

  @Input()
  public style: UserLayerStyleModel;

  @Input()
  public geometryType: AttributeTypeEnum;

  @Output()
  public styleUpdated: EventEmitter<UserLayerStyleModel> = new EventEmitter<UserLayerStyleModel>();

  public availableMarkers = StyleHelper.getAvailableMarkers();

  private debounce: number;
  private updatedProps: Map<keyof UserLayerStyleModel, string | number> = new Map();

  constructor() { }

  public ngOnInit(): void {}

  public showLineSettings() {
    return StyleHelper.showLineSettings(this.geometryType);
  }

  public showPolygonSettings() {
    return StyleHelper.showPolygonSettings(this.geometryType);
  }

  public showPointSettings() {
    return StyleHelper.showPointSettings(this.geometryType);
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

  public maxScaleChanged($event: number) {
    this.change('maxScale', $event);
  }

  public minScaleChanged($event: number) {
    this.change('minScale', $event);
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
    this.styleUpdated.emit(style);
    this.updatedProps.clear();
  }

}
