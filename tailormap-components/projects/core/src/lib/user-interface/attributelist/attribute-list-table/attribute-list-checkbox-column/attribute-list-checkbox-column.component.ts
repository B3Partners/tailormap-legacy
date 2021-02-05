import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { toggleCheckedAllRows, updateRowChecked } from '../../state/attribute-list.actions';
import { AttributeListRowModel } from '../../models/attribute-list-row.model';
import { AttributeListState } from '../../state/attribute-list.state';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CheckState } from '../../attributelist-common/attributelist-enums';
import { MatColumnDef, MatTable } from '@angular/material/table';

@Component({
  selector: 'tailormap-attribute-list-checkbox-column',
  templateUrl: './attribute-list-checkbox-column.component.html',
  styleUrls: ['../attribute-list-table.component.css'],
})
export class AttributeListCheckboxColumnComponent implements OnInit {

  @ViewChild(MatColumnDef)
  public columnDef: MatColumnDef;

  @Input()
  public layerId: string;

  @Input()
  public set rows(rows: AttributeListRowModel[]) {
    const someUnchecked = rows.findIndex(row => !row._checked) !== -1;
    const someChecked = rows.findIndex(row => row._checked) !== -1;
    this.checkState = someChecked && someUnchecked ? CheckState.Some : (someUnchecked ? CheckState.None : CheckState.All);
  }

  public checkState = CheckState.None;

  constructor(
    private store$: Store<AttributeListState>,
    private snackBar: MatSnackBar,
    @Optional() public table: MatTable<any>,
    private cdRef: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void {
    if (this.table) {
      this.cdRef.detectChanges();
      this.table.addColumnDef(this.columnDef);
    }
  }

  public onHeaderCheckClick($event: MouseEvent): void {
    $event.stopPropagation();
    this.store$.dispatch(toggleCheckedAllRows({ layerId: this.layerId }));
  }

  public onRowCheckClick($event: MouseEvent, row: AttributeListRowModel): void {
    $event.stopPropagation();
    this.store$.dispatch(updateRowChecked({ layerId: this.layerId, rowId: row.rowId, checked: !row._checked }));
  }

  public getCheckIcon() {
    if (this.checkState === 'All') {
      return 'check_box';
    }
    if (this.checkState === 'None') {
      return 'check_box_outline_blank';
    }
    return 'indeterminate_check_box';
  }

  public onStatisticsHelp(): void {
    this.snackBar.open('Open contextmenu in de betreffende kolom voor statistiche functies', 'Sluiten', {
      duration: 5000,
    });
    return;
  }

}
