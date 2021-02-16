import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { setAttributeListConfig, setAttributeListVisibility } from '../state/attribute-list.actions';
import { AttributeListConfig } from '../models/attribute-list.config';

@Component({
  selector: 'tailormap-attribute-list-button',
  templateUrl: './attribute-list-button.component.html',
  styleUrls: ['./attribute-list-button.component.css'],
})
export class AttributeListButtonComponent implements OnInit {

  @Input()
  public set attributeListConfig(config: AttributeListConfig) {
    this.store$.dispatch(setAttributeListConfig({ config: { ...config } }));
  }

  constructor(
    private store$: Store<AttributeListState>,
  ) { }

  public ngOnInit(): void {}

  public toggleVisibility() {
    this.store$.dispatch(setAttributeListVisibility({ visible: true }));
  }

}
