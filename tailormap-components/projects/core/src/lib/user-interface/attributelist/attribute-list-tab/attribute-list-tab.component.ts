import { Component, Input } from '@angular/core';

@Component({
  selector: 'tailormap-attribute-list-tab',
  templateUrl: './attribute-list-tab.component.html',
  styleUrls: ['./attribute-list-tab.component.css'],
})
export class AttributeListTabComponent {

  @Input()
  public layerId: string;

  constructor() {}

}
