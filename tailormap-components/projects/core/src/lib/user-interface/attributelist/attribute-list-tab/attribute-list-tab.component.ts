import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { loadDataForTab } from '../state/attribute-list.actions';
import { selectSelectedFeatureTypeForTab } from '../state/attribute-list.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'tailormap-attribute-list-tab',
  templateUrl: './attribute-list-tab.component.html',
  styleUrls: ['./attribute-list-tab.component.css'],
})
export class AttributeListTabComponent implements OnInit {

  @Input()
  public layerId: string;

  public featureType$: Observable<number>;

  constructor(
    private store$: Store<AttributeListState>,
  ) {}

  public ngOnInit() {
    this.store$.dispatch(loadDataForTab({ layerId: this.layerId }));
    this.featureType$ = this.store$.select(selectSelectedFeatureTypeForTab, this.layerId);
  }

}
