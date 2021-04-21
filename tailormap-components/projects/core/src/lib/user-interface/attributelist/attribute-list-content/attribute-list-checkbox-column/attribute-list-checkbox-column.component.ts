import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { toggleCheckedAllRows, updateRowChecked } from '../../state/attribute-list.actions';
import { AttributeListRowModel } from '../../models/attribute-list-row.model';
import { AttributeListState } from '../../state/attribute-list.state';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatColumnDef, MatTable } from '@angular/material/table';

enum CheckState {
  None = 'None',
  Some = 'Some',
  All = 'All',
}

@Component({
  selector: 'tailormap-attribute-list-checkbox-column',
  templateUrl: './attribute-list-checkbox-column.component.html',
  styleUrls: ['../attribute-list-content.component.css'],
})
export class AttributeListCheckboxColumnComponent implements OnInit, OnDestroy {

  @ViewChild(MatColumnDef)
  public columnDef: MatColumnDef;

  @Input()
  public featureType: number;

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

  private _checkedCount: number;
  private _uncheckedCount: number;
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

  public ngOnDestroy() {
    if (this.table) {
      this.table.removeColumnDef(this.columnDef);
    }
  }

  public onHeaderCheckClick(): void {
    this.store$.dispatch(toggleCheckedAllRows({ featureType: this.featureType }));
  }

  public onRowCheckClick(row: AttributeListRowModel): void {
    this.store$.dispatch(updateRowChecked({ featureType: this.featureType, rowId: row.rowId, checked: !row._checked }));
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
    this.snackBar.open('Klik in deze balk onder de betreffende kolom voor statistische functies', 'Sluiten', {
      duration: 5000,
    });
    return;
  }

  private updateCheckState() {
    this.checkState = this._uncheckedCount && this._checkedCount
      ? CheckState.Some
      : (this._uncheckedCount ? CheckState.None : CheckState.All);
  }

}
