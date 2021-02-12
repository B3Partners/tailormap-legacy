import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';

import { AttributelistTable } from '../attributelist-common/attributelist-models';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { AttributeListParameters, RelatedFeatureType } from '../../../shared/attribute-service/attribute-models';
import { Observable, Subject } from 'rxjs';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
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
// export class AttributelistDetailsComponent implements OnInit, AttributelistTable {
export class AttributelistDetailsComponent implements OnInit,
                                                      OnDestroy,
                                                      AttributelistTable,
                                                      AfterViewInit {

  // Table reference for 'manually' rendering.
  @ViewChild('detailtable') public table: MatTable<any>;

  // The parent layer id for this detail table.
  @Input()
  public parentLayerId: string;

  // The parent row featuretype for this detail table.
  @Input()
  public featureType: RelatedFeatureType;

  public rows$: Observable<AttributeListRowModel[]>;

  public columnsNames : string[];
  public columns : AttributeListColumnModel[];

  private destroyed = new Subject();

  constructor(private attributeService: AttributeService,
              private store$: Store<AttributeListState>,
              private applicationService: ApplicationService,) {
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
    // Update the table.
    this.updateTable();
  }

  public ngAfterViewInit(): void {

  }

  /**
   * Renders the table rows after the data is loaded.
   */
  public onAfterLoadData(): void {
    // Update the table rows.
    this.table.renderRows();
  }

  /**
   * Fired when a column header is clicked.
   */
  public onSortClick(sort: Sort): void {
    this.updateTable(sort);
  }

  /**
   * (Re)loads the data, which fires the "onAfterLoadData" method.
   */
  private updateTable(sort?: Sort): void {
    const sortDirection = (sort && sort.direction === 'asc') ? 'ASC' : (sort && sort.direction) === 'desc' ? 'DESC' : undefined;

    const attrParams: AttributeListParameters = {
      application: this.applicationService.getId(),
      appLayer: +(this.parentLayerId),
      featureType: this.featureType.id,
      filter: this.featureType.filter,
      //limit: featureTypeData.pageSize,
      page: 1,
    //  start: featureTypeData.pageIndex * featureTypeData.pageSize,
      clearTotalCountCache: true,
     // dir: featureTypeData.sortDirection,
     // sort: featureTypeData.sortedColumn || '',
    };
    this.rows$ = this.attributeService.features$(attrParams)
      .pipe(
        takeUntil(this.destroyed),
        map(response => {
          if(response.success){
            return response.features.map(feature =>{
              const a : AttributeListRowModel= {
                ...feature,
                rowId: ''+ feature.__fid,
                _checked: false,
                _expanded: false,
                _selected: false,

              };
              return a;
            });
          }else{
            return null;
          }


        })

      )

  //  this.dataSource.loadData(this, undefined, undefined, sort ? sort.active : undefined, sortDirection);
  }
}
