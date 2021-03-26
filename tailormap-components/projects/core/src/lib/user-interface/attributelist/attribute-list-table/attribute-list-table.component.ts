import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  selectActiveColumnsForTab, selectFeatureTypeDataForTab, selectLoadingDataForTab, selectTabAndFeatureTypeDataForTab,
} from '../state/attribute-list.selectors';
import { filter, map, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, Subject } from 'rxjs';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { AttributelistStatistic } from '../attributelist-common/attributelist-statistic';
import { StatisticService } from '../../../shared/statistic-service/statistic.service';
import { updateRowSelected, updateSort } from '../state/attribute-list.actions';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AttributeListStatisticsMenuComponent } from './attribute-list-statistics-menu/attribute-list-statistics-menu.component';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { AttributeListFilterComponent } from '../attribute-list-filter/attribute-list-filter.component';
import { MatDialog } from '@angular/material/dialog';
import { AttributeListFilterModel } from '../models/attribute-list-filter-models';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributeListTableComponent implements OnInit, OnDestroy {

  @Input()
  public layerId: string;

  public featureType: number;

  @ViewChild(AttributeListStatisticsMenuComponent)
  public statisticsMenuComponent: AttributeListStatisticsMenuComponent;

  private destroyed = new Subject();

  public rows$: Observable<AttributeListRowModel[]>;

  public statistic: AttributelistStatistic;

  public columns: AttributeListColumnModel[];
  public columnNames: string[];

  public uncheckedCount: number;
  public checkedCount: number;
  private filters: AttributeListFilterModel[];
  public showCheckboxColumn$: Observable<boolean>;
  public sort: { column: string; direction: string };
  public rowLength: number;

  public loadingData$: Observable<boolean>;
  public notLoadingData$: Observable<boolean>;

  constructor(
    private store$: Store<AttributeListState>,
    private statisticsService: StatisticService,
    private dialog: MatDialog,
  ) { }

  public ngOnInit(): void {
    this.statistic = new AttributelistStatistic(this.statisticsService, this.layerId);

    const featureTypeData$ = this.store$.select(selectFeatureTypeDataForTab, this.layerId);

    featureTypeData$
      .pipe(
        takeUntil(this.destroyed),
        filter(featureData => !!featureData),
      )
      .subscribe(featureData => {
        this.uncheckedCount = featureData.rows.filter(row => !row._checked).length;
        this.checkedCount = featureData.rows.filter(row => row._checked).length;
        this.featureType = featureData.featureType;
        this.sort = { column: featureData.sortedColumn, direction: featureData.sortDirection.toLowerCase() };
        this.filters = featureData.filter;
        this.rowLength = featureData.rows.length;
      });

    this.showCheckboxColumn$ = this.store$.select(selectTabAndFeatureTypeDataForTab, this.layerId)
      .pipe(
        filter(([tab, featureData]) => !!tab && !!featureData),
        map(([tab, featureData]) => tab.featureType === featureData.featureType),
      );

    combineLatest([
      this.store$.select(selectActiveColumnsForTab, this.layerId),
      this.showCheckboxColumn$,
    ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(([ columns, showCheckboxColumn ]) => {
        this.columns = columns;
        this.columnNames = this.getColumnNames(columns, showCheckboxColumn);
        this.statistic.initStatistics(columns);
      });

    this.rows$ = featureTypeData$.pipe(
      takeUntil(this.destroyed),
      filter(data => !!data),
      map(data => data.rows),
    );

    this.loadingData$ = this.store$.select(selectLoadingDataForTab, this.layerId);
    this.notLoadingData$ = this.store$.select(selectLoadingDataForTab, this.layerId).pipe(map(loading => !loading));
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public trackByRowId(idx: number, row: AttributeListRowModel) {
    return row.rowId;
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

  public onSortClick(columnName: string): void {
    let direction: 'asc' | 'desc' | '' = 'asc';
    if (this.sort.column === columnName) {
      direction = this.sort.direction === 'asc' ? 'desc' : '';
    }
    this.store$.dispatch(updateSort({ layerId: this.layerId, featureType: this.featureType, column: columnName, direction }));
  }

  public onFilterClick(columnName: string): void {
    const filterModel = this.filters.find(f => f.name === columnName);
    this.dialog.open(AttributeListFilterComponent, {
      data: {
        columnName,
        featureType: this.featureType,
        layerId: this.layerId,
        filter: filterModel,
      },
    });
  }

  public getIsFilterActive(columnName): boolean {
    const filterModel = this.filters.find(f => f.name === columnName);
    return !!filterModel;
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

  public getColumnNames(columns: AttributeListColumnModel[], showCheckboxColumn: boolean): string[] {
    const columnNames = [
      '_details',
      ...columns.map(c => c.name),
    ];
    if (showCheckboxColumn) {
      columnNames.unshift('_checked');
    }
    return columnNames;
  }

}
