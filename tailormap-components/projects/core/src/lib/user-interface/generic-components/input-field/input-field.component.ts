import { Component, OnInit } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';

@Component({
  selector: 'tailormap-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.css'],
})
export class InputFieldComponent extends BaseFieldComponent implements OnInit {

  constructor() {
    super();
  }


  public ngOnInit(): void {
  }

}
