import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'tailormap-resolution-range-selector',
  templateUrl: './resolution-range-selector.component.html',
  styleUrls: ['./resolution-range-selector.component.css'],
})
export class ResolutionRangeSelectorComponent implements OnInit {

  @Output()
  public minResolutionChanged: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  public minScaleChanged: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  public maxResolutionChanged: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  public maxScaleChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input()
  public selectedMinResolution: number;

  @Input()
  public selectedMinScale: number;

  @Input()
  public selectedMaxResolution: number;

  @Input()
  public selectedMaxScale: number;

  constructor() { }

  public ngOnInit(): void {}

  public minScaleChangedHandler($event: number) {
    this.minScaleChanged.emit($event);
  }

  public maxScaleChangedHandler($event: number) {
    this.maxScaleChanged.emit($event);
  }

  public minResolutionChangedHandler($event: number) {
    this.minResolutionChanged.emit($event);
  }

  public maxResolutionChangedHandler($event: number) {
    this.maxResolutionChanged.emit($event);
  }

}
