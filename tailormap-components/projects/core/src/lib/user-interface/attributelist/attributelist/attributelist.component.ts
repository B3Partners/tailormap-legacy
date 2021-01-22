import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributelistState } from '../state/attributelist.state';
import { selectAttributelistVisible } from '../state/attributelist.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'tailormap-attributelist',
  templateUrl: './attributelist.component.html',
  styleUrls: ['./attributelist.component.css'],
})
export class AttributelistComponent implements OnInit {

  public isVisible$: Observable<boolean>;

  constructor(
    private store$: Store<AttributelistState>,
  ) {
    this.isVisible$ = this.store$.select(selectAttributelistVisible);
  }

  public ngOnInit(): void {
  }

}
