import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { loadDataForTab } from '../state/attribute-list.actions';

@Component({
  selector: 'tailormap-attribute-list-tab',
  templateUrl: './attribute-list-tab.component.html',
  styleUrls: ['./attribute-list-tab.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributeListTabComponent implements OnInit {

  @Input()
  public layerId: string;

  @Input()
  public featureType: number;

  constructor(
    private store$: Store<AttributeListState>,
  ) {}

  public ngOnInit() {
    this.store$.dispatch(loadDataForTab({ layerId: this.layerId }));
  }

}
