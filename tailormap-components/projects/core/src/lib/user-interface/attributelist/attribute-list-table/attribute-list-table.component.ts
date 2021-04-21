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
export class AttributeListTableComponent implements OnInit {

  @Input()
  public layerId: string;

  @Input()
  public rows: AttributeListRowModel[];
  private static count = 0;

  @Input()
  public set columns(columns: AttributeListColumnModel[]) {
    this._columns = columns;
    this.columnNames = this.getColumnNames(columns);
  }

  public get columns() {
    return this._columns;
  }

  @Input()
  public set filters(filters: AttributeFilterModel[]) {
    this.filtersDictionary = new Map<string, AttributeFilterModel>(filters.map(f => [ f.attribute, f ]));
  }

  @Input()
  public set statistics(statistics: AttributeListStatisticColumnModel[]) {
    this.statisticsDictionary = new Map<string, AttributeListStatisticColumnModel>(statistics.map(s => [ s.name, s ]));
  }

  @Input()
  public sort: { column: string; direction: string };

  @Input()
  public showCheckboxColumn: boolean;

  @Input()
  public set checkedCount(count: number) {
    this._checkedCount = count;
    this.updateCheckState();
  }

  @Input()
  public set uncheckedCount(count: number) {
    this._uncheckedCount = count;
    this.updateCheckState();
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
  public loadStatistics = new EventEmitter<{ columnName: string; type: StatisticType }>();

  @Output()
  public setFilter = new EventEmitter<{ columnName: string; attributeType?: AttributeTypeEnum }>();

  @Output()
  public setSort = new EventEmitter<{ columnName: string; direction: 'asc' | 'desc' | ''}>();

  private _columns: AttributeListColumnModel[];

  public columnNames: string[];

  public statisticTypes = StatisticsHelper.getStatisticOptions();

  private filtersDictionary: Map<string, AttributeFilterModel> = new Map();
  private statisticsDictionary: Map<string, AttributeListStatisticColumnModel> = new Map();

  private _checkedCount: number;
  private _uncheckedCount: number;
  public checkState = CheckState.None;

  constructor() { }

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
    return !!this.filtersDictionary.get(columnName);
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
    return !!column && !column.processing &&  StatisticsHelper.getStatisticValue(col.dataType, column) !== null;
  }

  public getStatisticResult(col: AttributeListColumnModel): string {
    const column = this.statisticsDictionary.get(col.name);
    const value = StatisticsHelper.getStatisticValue(col.dataType, column);
    if (column && value) {
      return `${StatisticsHelper.getLabelForStatisticType(column.statisticType)} = ${value}`;
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
    this.loadStatistics.emit({ type, columnName: col.name });
  }

  private getColumnNames(columns: AttributeListColumnModel[]): string[] {
    const columnNames = [
      '_details',
      ...columns.map(c => c.name),
    ];
    if (this.showCheckboxColumn) {
      columnNames.unshift('_checked');
    }
    return columnNames;
  }

  private updateCheckState() {
    this.checkState = this._uncheckedCount && this._checkedCount
      ? CheckState.Some
      : (this._uncheckedCount ? CheckState.None : CheckState.All);
  }

  public getRenderCount() {
    return ++AttributeListTableComponent.count;
  }
}
