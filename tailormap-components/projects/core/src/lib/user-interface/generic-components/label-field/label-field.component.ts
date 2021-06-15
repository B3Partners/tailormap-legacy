import { Component, Input, OnInit } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';

@Component({
  selector: 'tailormap-label-field',
  templateUrl: './label-field.component.html',
  styleUrls: ['./label-field.component.css'],
})
export class LabelFieldComponent extends BaseFieldComponent implements OnInit {
  @Input()
  public valueTrue: string;
  constructor() {
    super();
  }

  public ngOnInit(): void {
  }

}
