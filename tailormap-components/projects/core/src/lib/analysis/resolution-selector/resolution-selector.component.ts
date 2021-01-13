import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'tailormap-resolution-selector',
  templateUrl: './resolution-selector.component.html',
  styleUrls: ['./resolution-selector.component.css'],
})
export class ResolutionSelectorComponent implements OnInit {

  @Input()
  public set selectedResolution(resolution: number) {
    if (!this.resolutionControl.value || this.resolutionControl.value.resolution !== resolution) {
      const val = this.availableResolutions.find(ar => ar.resolution === resolution);
      if (val) {
        this.resolutionControl.patchValue(val);
      }
    }
  }

  @Input()
  public set selectedScale(scale: number) {
    if (!this.resolutionControl.value || this.resolutionControl.value.scale !== scale) {
      const val = this.availableResolutions.find(ar => ar.scale === scale);
      if (val) {
        this.resolutionControl.patchValue(val);
      }
    }
  }

  @Output()
  public resolutionChanged: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  public scaleChanged: EventEmitter<number> = new EventEmitter<number>();

  public availableResolutions: Array<{ label: string; scale: number, resolution: number }> = [
    { label: 'Altijd tonen', scale: -1, resolution: -1 },
    { label: '1 / 1.536.000 (land)', scale: 1536000, resolution: 430.08 },
    { label: '1 / 768.000', scale: 768000, resolution: 215.04 },
    { label: '1 / 384.000', scale: 384000, resolution: 107.52 },
    { label: '1 / 192.000 (provincie)', scale: 192000, resolution: 53.76 },
    { label: '1 / 96.000', scale: 96000, resolution: 26.88 },
    { label: '1 / 48.000 (gemeente)', scale: 48000, resolution: 13.44 },
    { label: '1 / 24.000 (stad/dorp)', scale: 24000, resolution: 6.72 },
    { label: '1 / 12.000 (wijk)', scale: 12000, resolution: 3.36 },
    { label: '1 / 6.000 ', scale: 6000, resolution: 1.68 },
    { label: '1 / 3.000 (buurt)', scale: 3000, resolution: 0.84 },
    { label: '1 / 1.500', scale: 1500, resolution: 0.42 },
    { label: '1 / 750 (straat)', scale: 750, resolution: 0.21 },
    { label: '1 / 375', scale: 375, resolution: 0.105 },
  ];

  public resolutionControl = new FormControl('');

  constructor() { }

  public ngOnInit(): void {
    this.resolutionControl.valueChanges
      .subscribe(value => {
        this.resolutionChanged.emit(value.resolution);
        this.scaleChanged.emit(value.scale);
      });
  }

}
