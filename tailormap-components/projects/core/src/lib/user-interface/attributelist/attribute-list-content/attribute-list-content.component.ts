import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  selectActiveColumnsForTab, selectCheckedUncheckedCountForTab, selectFeatureTypeForTab, selectFiltersForTab,
  selectLoadingDataForTab, selectRowCountForTab, selectRowsForTab, selectShowCheckboxColumnForTab, selectSortForTab, selectStatisticsForTab,
} from '../state/attribute-list.selectors';
import { map, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import {
  loadStatisticsForColumn, toggleCheckedAllRows, updateRowChecked, updateRowExpanded, updateRowSelected, updateSort,
} from '../state/attribute-list.actions';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { AttributeListFilterComponent } from '../attribute-list-filter/attribute-list-filter.component';
import { MatDialog } from '@angular/material/dialog';
import { AttributeListStatisticColumnModel } from '../models/attribute-list-statistic-column.model';
import { StatisticType } from '../../../shared/statistic-service/statistic-models';
import { AttributeFilterModel } from '../../../shared/models/attribute-filter.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttributeTypeEnum } from '../../../shared/models/attribute-type.enum';

@Component({
  selector: 'tailormap-attribute-list-content',
  templateUrl: './attribute-list-content.component.html',
  styleUrls: ['./attribute-list-content.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributeListContentComponent implements OnInit, OnDestroy {

  @Input()
  public layerId: string;

  public featureType: number;

  private destroyed = new Subject();

  public rows$: Observable<AttributeListRowModel[]>;
  public columns$: Observable<AttributeListColumnModel[]>;
  public showCheckboxColumn$: Observable<boolean>;
  public loadingData$: Observable<boolean>;
  public notLoadingData$: Observable<boolean>;
  public statistics$: Observable<AttributeListStatisticColumnModel[]>;
  public checkCounters$: Observable<{ unchecked: number; checked: number }>;
  public sort$: Observable<{ column: string; direction: string }>;
  public filters$: Observable<AttributeFilterModel[]>;
  public rowLength$: Observable<number>;

  constructor(
    private store$: Store<AttributeListState>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  public ngOnInit(): void {
    this.store$.select(selectFeatureTypeForTab, this.layerId)
      .pipe(takeUntil(this.destroyed))
      .subscribe(featureType => this.featureType = featureType);

    this.rows$ = this.store$.select(selectRowsForTab, this.layerId);
    this.checkCounters$ = this.store$.select(selectCheckedUncheckedCountForTab, this.layerId);
    this.sort$ = this.store$.select(selectSortForTab, this.layerId);
    this.filters$ = this.store$.select(selectFiltersForTab, this.layerId);
    this.rowLength$ = this.store$.select(selectRowCountForTab, this.layerId);
    this.statistics$ = this.store$.select(selectStatisticsForTab, this.layerId);
    this.showCheckboxColumn$ = this.store$.select(selectShowCheckboxColumnForTab, this.layerId);
    this.columns$ = this.store$.select(selectActiveColumnsForTab, this.layerId);
    this.loadingData$ = this.store$.select(selectLoadingDataForTab, this.layerId);
    this.notLoadingData$ = this.store$.select(selectLoadingDataForTab, this.layerId).pipe(map(loading => !loading));
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public onRowClick(row: { rowId: string; selected: boolean }): void {
    this.store$.dispatch(updateRowSelected({
      featureType: this.featureType,
      layerId: this.layerId,
      rowId: row.rowId,
      selected: row.selected,
    }));
  }

  public onSortClick(sort: { columnName: string; direction: 'asc' | 'desc' | '' }): void {
    this.store$.dispatch(updateSort({
      layerId: this.layerId,
      featureType: this.featureType,
      column: sort.columnName,
      direction: sort.direction,
    }));
  }

  public onFilterClick(col: { columnName: string; attributeType?: AttributeTypeEnum }): void {
    this.store$.select(selectFiltersForTab, this.layerId)
      .pipe(
        take(1),
        map(filters => filters.find(f => f.attribute === col.columnName)),
      )
      .subscribe(filterModel => {
        this.dialog.open(AttributeListFilterComponent, {
          data: {
            columnName: col.columnName,
            featureType: this.featureType,
            layerId: this.layerId,
            filter: filterModel,
            columnType: col.attributeType,
          },
        });
      });
  }

  public loadStatistic(statistics: { type: StatisticType; columnName: string; dataType: string }) {
    this.store$.dispatch(loadStatisticsForColumn({
      layerId: this.layerId,
      featureType: this.featureType,
      column: statistics.columnName,
      statisticType: statistics.type,
      dataType: statistics.dataType,
    }));
  }

  public onHeaderCheckClick(): void {
    this.store$.dispatch(toggleCheckedAllRows({ featureType: this.featureType }));
  }

  public onRowCheckClick(row: { rowId: string; checked: boolean }): void {
    this.store$.dispatch(updateRowChecked({ featureType: this.featureType, rowId: row.rowId, checked: row.checked }));
  }

  public onStatisticsHelp(): void {
    this.snackBar.open('Klik in deze balk onder de betreffende kolom voor statistische functies', 'Sluiten', {
      duration: 5000,
    });
    return;
  }

  public onRowExpandClick(row: { rowId: string; expanded: boolean }): void {
    this.store$.dispatch(updateRowExpanded({ featureType: this.featureType, rowId: row.rowId, expanded: row.expanded }));
  }

}
