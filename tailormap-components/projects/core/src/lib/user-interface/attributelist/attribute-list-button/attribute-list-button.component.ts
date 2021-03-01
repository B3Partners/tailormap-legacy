import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { setAttributeListConfig, setAttributeListVisibility } from '../state/attribute-list.actions';
import { AttributeListConfig } from '../models/attribute-list.config';
import { selectAttributeListVisible } from '../state/attribute-list.selectors';
import { take } from 'rxjs/operators';

@Component({
  selector: 'tailormap-attribute-list-button',
  templateUrl: './attribute-list-button.component.html',
  styleUrls: ['./attribute-list-button.component.css'],
})
export class AttributeListButtonComponent implements OnInit {

  public tooltip: string;

  @Input()
  public set attributeListConfig(configJsonString: string) {
    const config: AttributeListConfig = JSON.parse(configJsonString);
    this.store$.dispatch(setAttributeListConfig({ config }));
    if (config.tooltip) {
      this.tooltip = config.tooltip;
    }
  }

  constructor(
    private store$: Store<AttributeListState>,
  ) { }

  public ngOnInit(): void {}

  public toggleVisibility() {
    this.store$.select(selectAttributeListVisible)
      .pipe(take(1))
      .subscribe(visible => this.store$.dispatch(setAttributeListVisibility({ visible: !visible })));
  }

}
