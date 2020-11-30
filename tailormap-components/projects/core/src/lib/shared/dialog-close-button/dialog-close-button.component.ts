import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'tailormap-dialog-close-button',
  templateUrl: './dialog-close-button.component.html',
  styleUrls: ['./dialog-close-button.component.css'],
})
export class DialogCloseButtonComponent {

  @Input()
  public icon?: string;

  @Output()
  public closeDialog = new EventEmitter();

  constructor() { }
}
