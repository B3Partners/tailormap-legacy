import { Component, ElementRef, EventEmitter, Input, Optional, Output, TemplateRef, ViewChild } from '@angular/core';
import { PopoverService } from '../popover/popover.service';
import { OverlayRef } from '../overlay-service/overlay-ref';

@Component({
  selector: 'tailormap-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.css'],
})
export class IconPickerComponent {

  @ViewChild('iconPickerButton', { static: true, read: ElementRef })
  private iconPickerButton: ElementRef<HTMLButtonElement>;

  @ViewChild('iconPickerContent', { static: false, read: TemplateRef })
  private iconPickerContent: TemplateRef<any>;

  @Input()
  public icons: string[];

  @Input()
  public selectedIcon: string;

  @Output()
  public iconChange = new EventEmitter<string>();

  @Optional() @Input()
  public class: string;

  public pickerOpen = false;

  private popoverRef: OverlayRef;

  constructor(private popper: PopoverService) {}

  public openPicker() {
    if (this.popoverRef) {
      this.popoverRef.close();
    }
    const ICON_SIZE = 24;
    const PADDING = 10;
    const TOGGLE_WIDTH = 51;
    this.popoverRef = this.popper.open({
      origin: this.iconPickerButton.nativeElement,
      content: this.iconPickerContent,
      height: ((ICON_SIZE + PADDING) * this.icons.length) + PADDING,
      width: TOGGLE_WIDTH,
    });
  }

  public getClass() {
    const cls =  ['color-picker'];
    if (this.class) {
      cls.push(this.class);
    }
    return cls;
  }

  public selectIcon(icon: string) {
    this.pickerOpen = false;
    this.iconChange.emit(icon);
    this.popoverRef.close();
  }

}
