import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { AttributeListFeature, AttributeListParameters, RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';
import { Observable, Subject } from 'rxjs';
import { AttributeListState } from '../state/attribute-list.state';
import { Store } from '@ngrx/store';
import { selectActiveColumnsForFeature, selectFeatureTypeData } from '../state/attribute-list.selectors';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ApplicationService } from '../../../application/services/application.service';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';

@Component({
  selector: 'tailormap-attribute-list-details',
  templateUrl: './attribute-list-details.component.html',
  styleUrls: ['./attribute-list-details.component.css'],
})

export class AttributeListDetailsComponent implements OnInit, OnDestroy {

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
    this.store$.select(selectFeatureTypeData, this.featureType.id).pipe(
      takeUntil(this.destroyed),
      filter(featureData => !!featureData),
    ).subscribe(featureData => {
      this.columns = featureData.columns;
      this.columnsNames = featureData.columns.map(column => column.name);
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
      dir: !!sort && !!sort.direction ? sort.direction.toUpperCase() : 'ASC',
      sort: !!sort ? sort.active : '',
    };
    this.rows$ = this.attributeService.features$(attrParams)
      .pipe(
        takeUntil(this.destroyed),
        map(response => response.success ? response.features : []),
      );
  }
}
