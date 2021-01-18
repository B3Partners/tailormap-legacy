import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { debounceTime, filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { colorValidator, isValidColor } from '../util/color';
import { PopoverService } from '../popover/popover.service';
import { OverlayRef } from '../overlay-service/overlay-ref';

const defaultColors = [
  'rgb(136, 14, 79)',
  'rgb(165, 39, 20)',
  'rgb(170, 0, 0)',
  'rgb(230, 81, 0)',
  'rgb(249, 168, 37)',
  'rgb(255, 214, 0)',
  'rgb(129, 119, 23)',
  'rgb(85, 139, 47)',
  'rgb(9, 113, 56)',
  'rgb(0, 96, 100)',
  'rgb(1, 87, 155)',
  'rgb(26, 35, 126)',
  'rgb(103, 58, 183)',
  'rgb(78, 52, 46)',
  'rgb(194, 24, 91)',
  'rgb(255, 82, 82)',
  'rgb(204, 0, 0)',
  'rgb(245, 124, 0)',
  'rgb(251, 192, 45)',
  'rgb(255, 234, 0)',
  'rgb(175, 180, 43)',
  'rgb(124, 179, 66)',
  'rgb(15, 157, 88)',
  'rgb(0, 151, 167)',
  'rgb(2, 136, 209)',
  'rgb(57, 73, 171)',
  'rgb(156, 39, 176)',
  'rgb(121, 85, 72)',
  'rgb(244, 143, 177)',
  'rgb(237, 162, 155)',
  'rgb(234, 153, 153)',
  'rgb(255, 204, 128)',
  'rgb(250, 218, 128)',
  'rgb(255, 255, 141)',
  'rgb(230, 238, 156)',
  'rgb(197, 225, 165)',
  'rgb(135, 206, 172)',
  'rgb(178, 235, 242)',
  'rgb(161, 194, 250)',
  'rgb(159, 168, 218)',
  'rgb(206, 147, 216)',
  'rgb(188, 170, 164)',
  'rgb(255, 255, 255)',
  'rgb(189, 189, 189)',
  'rgb(117, 117, 117)',
  'rgb(66, 66, 66)',
  'rgb(0, 0, 0)',
];

@Component({
  selector: 'tailormap-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css'],
})
export class ColorPickerComponent implements OnInit, OnDestroy {

  @ViewChild('colorPickerButton', { static: true, read: ElementRef })
  private colorPickerButton: ElementRef<HTMLButtonElement>;

  @ViewChild('colorPickerContent', { static: false, read: TemplateRef })
  private colorPickerContent: TemplateRef<any>;

  @Input()
  public color: string;

  @Output()
  public colorChange = new EventEmitter<string>();

  @Optional() @Input()
  public class: string;

  @Input()
  public toggleFormat: 'circle' | 'line' | 'polygon' | 'text' = 'polygon';

  @Input()
  public allowEmptyColor = false;

  public pickerOpen = false;

  public sortedColors: string[] = [];

  private subscription = new Subscription();

  public formControl = new FormControl('');

  private popoverRef: OverlayRef;

  private preferredWindowWidth = 515;

  constructor(private popper: PopoverService) {
  }

  public ngOnInit(): void {
    const validators: ValidatorFn[] = [
      colorValidator(this.allowEmptyColor),
    ];
    if (!this.allowEmptyColor) {
      validators.push(Validators.required);
    }
    this.formControl.setValidators(validators);
    this.formControl.patchValue(this.color);
    const colorChange$ = this.formControl.valueChanges
      .pipe(debounceTime(250), filter(val => val !== '' && isValidColor(val, this.allowEmptyColor)))
      .subscribe((val: string) => this.colorChange.emit(val));

    this.subscription.add(colorChange$);
  }

  public getPickerColors() {
    if (window.innerWidth > this.preferredWindowWidth) {
      if (this.allowEmptyColor) {
        return defaultColors.concat(undefined);
      }
      return defaultColors;
    }
    if (this.sortedColors.length !== 0) {
      return this.sortedColors;
    }
    // When we have a small screen we sort the colors by luminosity
    const colors = [ ...defaultColors ];
    if (this.allowEmptyColor) {
      colors.push(undefined);
    }
    const sumColor = (str: string) => {
      if (str === undefined) {
        return 1000;
      }
      // https://stackoverflow.com/questions/27960722/sort-array-with-rgb-color-on-javascript
      const rgb = str.replace(/[rgb()]/g, '').split(',').map(Number);
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };
    colors.sort((c1, c2) => {
      const sumC1 = sumColor(c1);
      const sumC2 = sumColor(c2);
      return sumC1 === sumC2 ? 0 : sumC1 > sumC2 ? 1 : -1;
    });
    this.sortedColors = colors;
    return this.sortedColors;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public hasError() {
    return this.formControl.invalid && (this.formControl.dirty || this.formControl.touched);
  }

  public openPicker() {
    if (this.popoverRef) {
      this.popoverRef.close();
    }
    this.popoverRef = this.popper.open({
      origin: this.colorPickerButton.nativeElement,
      content: this.colorPickerContent,
      height: 215,
      width: Math.min(this.preferredWindowWidth, window.innerWidth),
      closeOnClickOutside: true,
    });
  }

  public getClass() {
    const cls =  ['color-picker'];
    if (this.class) {
      cls.push(this.class);
    }
    if (this.hasError()) {
      cls.push('color-picker--has-error');
    }
    return cls;
  }

  public selectColor(color: string) {
    this.formControl.setValue(color);
    this.pickerOpen = false;
    this.colorChange.emit(color);
    this.popoverRef.close();
  }

}
