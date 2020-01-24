import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Attribute, FeatureAttribute } from '../../shared/wegvakken-models';

@Component({
  selector: 'flamingo-wegvak-formfield',
  templateUrl: './wegvak-formfield.component.html',
  styleUrls: ['./wegvak-formfield.component.css'],
})
export class WegvakFormfieldComponent implements OnInit {

  @Input()
  public attribute: Attribute;

  @Input()
  public form: FormGroup;

  @Input()
  public featureAttribute: FeatureAttribute;

  constructor() { }

  public ngOnInit() {
  }

}
