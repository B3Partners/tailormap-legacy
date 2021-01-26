import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'tailormap-base-field',
  templateUrl: './base-field.component.html',
  styleUrls: ['./base-field.component.css'],
})
export class BaseFieldComponent implements OnInit {
  @Input()
  public id : string;

  @Input()
  public label : string;

  @Input()
  public placeholder : string;

  @Input()
  public value : string;

  @Input()
  public groep: FormGroup;

  @Input()
  public hidden: boolean;

  constructor() { }

  public ngOnInit(): void {
  }

}
