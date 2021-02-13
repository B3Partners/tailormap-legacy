import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { AttributeListFeature, AttributeListParameters, RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';
import { Observable, Subject } from 'rxjs';
import { AttributeListState } from '../state/attribute-list.state';
import { Store } from '@ngrx/store';
import { selectActiveColumnsForFeature } from '../state/attribute-list.selectors';
import { map, takeUntil } from 'rxjs/operators';
import { ApplicationService } from '../../../application/services/application.service';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';

@Component({
  selector: 'tailormap-attributelist-details',
  templateUrl: './attributelist-details.component.html',
  styleUrls: ['./attributelist-details.component.css'],
})

export class AttributelistDetailsComponent implements OnInit, OnDestroy {

  @Input()
  public parentLayerId: string;

  @Input()
  public featureType: RelatedFeatureType;

  public rows$: Observable<AttributeListFeature[]>;

  public columnsNames: string[];
  public columns: AttributeListColumnModel[];

  private destroyed = new Subject();

  constructor(private attributeService: AttributeService,
              private store$: Store<AttributeListState>,
              private applicationService: ApplicationService) {
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public ngOnInit(): void {
    this.store$.select(selectActiveColumnsForFeature, this.featureType.id).pipe(
      takeUntil(this.destroyed)).subscribe(columns => {
      this.columns = columns;
      this.columnsNames = columns.map(column => column.name);
    })
    this.updateTable();
  }

  public onSortClick(sort: Sort): void {
    this.updateTable(sort);
  }

  private updateTable(sort?: Sort): void {
    const attrParams: AttributeListParameters = {
      application: this.applicationService.getId(),
      appLayer: +(this.parentLayerId),
      featureType: this.featureType.id,
      filter: this.featureType.filter,
      page: 1,
      clearTotalCountCache: true,
    };
    this.rows$ = this.attributeService.features$(attrParams)
      .pipe(
        takeUntil(this.destroyed),
        map(response => response.success ? response.features : []),
      );
  }
}
