import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { AttributeListFeature, AttributeListParameters, RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';
import { Observable, Subject } from 'rxjs';
import { AttributeListState } from '../state/attribute-list.state';
import { Store } from '@ngrx/store';
import { selectFeatureTypeData } from '../state/attribute-list.selectors';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ApplicationService } from '../../../application/services/application.service';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';

const DETAILS_LIMIT = 100;

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
    });
    this.updateTable();
  }

  public onSortClick(sort: Sort): void {
    this.updateTable(sort);
  }

  public trackById(idx: number, feature: AttributeListFeature) {
    return feature.__fid;
  }

  private updateTable(sort?: Sort): void {
    const attrParams: AttributeListParameters = {
      application: this.applicationService.getId(),
      appLayer: +(this.parentLayerId),
      featureType: this.featureType.id,
      filter: this.featureType.filter,
      limit: DETAILS_LIMIT,
    };
    if (sort && sort.active && sort.direction) {
      attrParams.dir = sort.direction.toUpperCase();
      attrParams.sort = sort.active;
    }
    this.rows$ = this.attributeService.features$(attrParams)
      .pipe(
        takeUntil(this.destroyed),
        map(response => response.success ? response.features : []),
      );
  }
}
