import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { selectFeatureTypeData, selectTab } from '../state/attribute-list.selectors';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributelistStatistic } from '../attributelist-common/attributelist-statistic';
import { StatisticService } from '../../../shared/statistic-service/statistic.service';
import { updateRowSelected, updateSort } from '../state/attribute-list.actions';
import { Sort } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AttributeListStatisticsMenuComponent } from './attribute-list-statistics-menu/attribute-list-statistics-menu.component';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';

@Component({
  selector: 'tailormap-attribute-list-table',
  templateUrl: './attribute-list-table.component.html',
  styleUrls: ['./attribute-list-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AttributeListTableComponent implements OnInit, OnDestroy {

  @Input()
  public layerId: string;

  @Input()
  public featureType: number;

  @ViewChild(AttributeListStatisticsMenuComponent)
  public statisticsMenuComponent: AttributeListStatisticsMenuComponent;

  private destroyed = new Subject();

  public tab: AttributeListTabModel;
  public rows$: Observable<AttributeListRowModel[]>;

  public statistic: AttributelistStatistic;

  private columns: AttributeListColumnModel[];
  public columnNames: string[];

  public uncheckedCount: number;
  public checkedCount: number;

  constructor(
    private store$: Store<AttributeListState>,
    private statisticsService: StatisticService,
  ) { }

  public ngOnInit(): void {
    this.statistic = new AttributelistStatistic(
      this.store$,
      this.statisticsService,
      this.layerId,
    );

    const featureTypeData$ = this.store$.select(selectFeatureTypeData, this.featureType);

    featureTypeData$.pipe(takeUntil(this.destroyed))
      .subscribe(featureData => {
        this.columns = featureData.columns;
        this.statistic.initStatistics(this.getVisibleColumns());
        this.columnNames = this.getColumnNames();
        this.uncheckedCount = featureData.rows.filter(row => !row._checked).length;
        this.checkedCount = featureData.rows.filter(row => row._checked).length;
      });

    this.rows$ = featureTypeData$.pipe(
      takeUntil(this.destroyed),
      map(tab => tab.rows),
    );
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public getVisibleColumns() {
    return this.columns.filter(c => c.visible);
  }

  public trackByRowId(idx: number, row: AttributeListRowModel) {
    return row.rowId
  }

  public onRowClick($event: MouseEvent, row: AttributeListRowModel): void {
    $event.stopPropagation();
    this.store$.dispatch(updateRowSelected({
      featureType: this.featureType,
      layerId: this.layerId,
      rowId: row.rowId,
      selected: !row._selected,
    }));
  }

  public onSortClick(sort: Sort): void {
    this.store$.dispatch(updateSort({ featureType: this.featureType, column: sort.active, direction: sort.direction }));
  }

  public onFilterClick(columnName: string): void {
    // this.filterMap.get(this.dataSource.params.featureTypeId).setFilter(this, columnName);
  }

  public getIsFilterActive(columnName): boolean {
    return false;
  }

  public onStatisticsMenu(event: MouseEvent, colName: string) {
    event.preventDefault();
    this.statisticsMenuComponent.open(colName, event.clientX, event.clientY);
  }

  public getStatisticResult(colName: string): string {
    return this.statistic.getStatisticResult(colName);
  }

  public isStatisticsProcessing(colName: string): boolean {
    return this.statistic.isStatisticsProcessing(colName);
  }

  public getColumnNames(): string[] {
    return [
      '_checked',
      '_details',
      ...this.getVisibleColumns().map(c => c.name),
    ];
  }

}
