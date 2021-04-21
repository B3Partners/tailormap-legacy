import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AttributeListRowModel } from '../models/attribute-list-row.model';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { StatisticsHelper } from '../helpers/statistics-helper';
import { StatisticType } from '../../../shared/statistic-service/statistic-models';
import { AttributeFilterModel } from '../../../shared/models/attribute-filter.model';
import { AttributeListStatisticColumnModel } from '../models/attribute-list-statistic-column.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AttributeTypeEnum } from '../../../shared/models/attribute-type.enum';

enum CheckState {
  None = 'None',
  Some = 'Some',
  All = 'All',
}

interface StatisticValue {
  statisticType: StatisticType;
  statisticValue: string;
  labelForStatisticType: string;
  processing: boolean;
}

@Component({
  selector: 'tailormap-attribute-list-table',
  templateUrl: './attribute-list-table.component.html',
  styleUrls: ['./attribute-list-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributeListTableComponent implements OnInit {

  @Input()
  public layerId: string;

  @Input()
  public rows: AttributeListRowModel[];

  @Input()
  public set columns(columns: AttributeListColumnModel[]) {
    this._columns = columns;
    this.columnNames = this.updateColumnNames();
  }

  public get columns() {
    return this._columns;
  }

  @Input()
  public set filters(filters: AttributeFilterModel[]) {
    this.filtersDictionary = new Set<string>(filters.map(f => f.attribute));
  }

  @Input()
  public set statistics(statistics: AttributeListStatisticColumnModel[]) {
    this.statisticsDictionary = new Map<string, StatisticValue>(statistics.map(
      s => {
        const statisticValue = StatisticsHelper.getStatisticValue(s.dataType, s);
        const label = StatisticsHelper.getLabelForStatisticType(s.statisticType);
        const value: StatisticValue = {
          statisticType: s.statisticType,
          labelForStatisticType: `${label} = ${statisticValue}`,
          processing: s.processing,
          statisticValue,
        };
        return [s.name, value];
      },
    ));
  }

  @Input()
  public sort: { column: string; direction: string };

  @Input()
  public set showCheckboxColumn(showCheckboxColumn: boolean) {
    this._showCheckboxColumn = showCheckboxColumn;
    this.columnNames = this.updateColumnNames();
  }

  public get showCheckboxColumn() {
    return this._showCheckboxColumn;
  }

  @Input()
  public set checkedCounters(counters: { checked: number; unchecked: number }) {
    this.updateCheckState(counters);
  }

  @Output()
  public headerCheckboxChanged = new EventEmitter();

  @Output()
  public rowCheckboxChanged = new EventEmitter<{ rowId: string; checked: boolean }>();

  @Output()
  public statisticHelp = new EventEmitter();

  @Output()
  public expandRow = new EventEmitter<{ rowId: string; expanded: boolean }>();

  @Output()
  public selectRow = new EventEmitter<{ rowId: string; selected: boolean }>();

  @Output()
  public loadStatistics = new EventEmitter<{ columnName: string; type: StatisticType; dataType: string }>();

  @Output()
  public setFilter = new EventEmitter<{ columnName: string; attributeType?: AttributeTypeEnum }>();

  @Output()
  public setSort = new EventEmitter<{ columnName: string; direction: 'asc' | 'desc' | '' }>();

  private _columns: AttributeListColumnModel[];
  private _showCheckboxColumn: boolean;

  public columnNames: string[];

  public statisticTypes = StatisticsHelper.getStatisticOptions();

  public checkState = CheckState.None;

  private filtersDictionary: Set<string> = new Set();
  private statisticsDictionary: Map<string, StatisticValue> = new Map();

  constructor() {
  }

  public ngOnInit(): void {
  }

  public trackByRowId(idx: number, row: AttributeListRowModel) {
    return row.rowId;
  }

  public onHeaderCheckClick(): void {
    this.headerCheckboxChanged.emit();
  }

  public onRowCheckClick(row: AttributeListRowModel): void {
    this.rowCheckboxChanged.emit({ rowId: row.rowId, checked: !row._checked });
  }

  public onStatisticsHelp() {
    this.statisticHelp.emit();
  }

  public onRowExpandClick($event: MouseEvent, row: AttributeListRowModel): void {
    $event.stopPropagation();
    this.expandRow.emit({ rowId: row.rowId, expanded: !row._expanded });
  }

  public getIsFilterActive(columnName): boolean {
    return this.filtersDictionary.has(columnName);
  }

  public onFilterClick($event: MouseEvent, column: AttributeListColumnModel): void {
    $event.stopPropagation();
    this.setFilter.emit({ columnName: column.name, attributeType: column.attributeType });
  }

  public onSortClick(columnName: string): void {
    let direction: 'asc' | 'desc' | '' = 'asc';
    if (this.sort.column === columnName) {
      direction = this.sort.direction === 'asc' ? 'desc' : '';
    }
    this.setSort.emit({ columnName, direction });
  }

  public onRowClick($event: MouseEvent, row: AttributeListRowModel): void {
    $event.stopPropagation();
    this.selectRow.emit({ rowId: row.rowId, selected: !row._selected });
  }

  public hasStatisticResult(col: AttributeListColumnModel): boolean {
    const column = this.statisticsDictionary.get(col.name);
    return column && column.statisticValue !== null;
  }

  public getStatisticResult(col: AttributeListColumnModel): string {
    const column = this.statisticsDictionary.get(col.name);
    if (column && column.statisticValue) {
      return column.labelForStatisticType;
    }
    return '';
  }

  public isStatisticsProcessing(colName: string): boolean {
    return this.statisticsDictionary.get(colName)?.processing;
  }

  public isStatisticsTypeAvailable(type: StatisticType, col: AttributeListColumnModel) {
    return StatisticsHelper.isStatisticTypeAvailable(type, col.dataType);
  }

  public isStatisticsTypeSelected(type: StatisticType, col: AttributeListColumnModel) {
    const statisticColumn = this.statisticsDictionary.get(col.name);
    return !!statisticColumn && statisticColumn.statisticType === type;
  }

  public loadStatisticClicked(type: StatisticType, col: AttributeListColumnModel) {
    this.loadStatistics.emit({ type, columnName: col.name, dataType: col.dataType });
  }

  private updateColumnNames(): string[] {
    if (!this.columns) {
      return;
    }
    const columnNames = [
      '_details',
      ...this.columns.map(c => c.name),
    ];
    if (this.showCheckboxColumn) {
      columnNames.unshift('_checked');
    }
    return columnNames;
  }

  private updateCheckState(counters: { checked: number; unchecked: number }) {
    this.checkState = counters.unchecked && counters.checked
      ? CheckState.Some
      : (counters.unchecked ? CheckState.None : CheckState.All);
  }

}
