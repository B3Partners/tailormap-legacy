import { ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild } from '@angular/core';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../../state/attribute-list.state';
import { AttributeListRowModel } from '../../models/attribute-list-row.model';
import { updateRowExpanded } from '../../state/attribute-list.actions';

@Component({
  selector: 'tailormap-attribute-list-details-column',
  templateUrl: './attribute-list-details-column.component.html',
  styleUrls: ['../attribute-list-content.component.css'],
})
export class AttributeListDetailsColumnComponent implements OnInit {

  @ViewChild(MatColumnDef)
  public columnDef: MatColumnDef;

  @Input()
  public featureType: number;

  constructor(
    private store$: Store<AttributeListState>,
    @Optional() public table: MatTable<any>,
    private cdRef: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void {
    if (this.table) {
      this.cdRef.detectChanges();
      this.table.addColumnDef(this.columnDef);
    }
  }
  public onRowExpandClick($event: MouseEvent, row: AttributeListRowModel): void {
    $event.stopPropagation();
    this.store$.dispatch(updateRowExpanded({ featureType: this.featureType, rowId: row.rowId, expanded: !row._expanded }));
  }

}
