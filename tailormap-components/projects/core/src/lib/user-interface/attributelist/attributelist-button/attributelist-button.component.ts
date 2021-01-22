import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributelistState } from '../state/attributelist.state';
import { setAttributelistConfig, toggleAttributelistVisibility } from '../state/attributelist.actions';
import { AttributelistConfig } from '../models/attributelist.config';

@Component({
  selector: 'tailormap-attributelist-button',
  templateUrl: './attributelist-button.component.html',
  styleUrls: ['./attributelist-button.component.css'],
})
export class AttributelistButtonComponent implements OnInit {

  @Input()
  public set attributeListConfig(config: AttributelistConfig) {
    this.store$.dispatch(setAttributelistConfig({ config: { ...config } }));
  }

  constructor(
    private store$: Store<AttributelistState>,
  ) { }

  public ngOnInit(): void {}

  public toggleVisibility() {
    this.store$.dispatch(toggleAttributelistVisibility());
  }

}
