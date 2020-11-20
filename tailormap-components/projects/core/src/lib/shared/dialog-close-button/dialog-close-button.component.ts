import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'tailormap-dialog-close-button',
  templateUrl: './dialog-close-button.component.html',
  styleUrls: ['./dialog-close-button.component.css'],
})
export class DialogCloseButtonComponent {

  @Output()
  public closeDialog = new EventEmitter();

  constructor() { }
}
