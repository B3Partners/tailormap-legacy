import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { OVERLAY_DATA } from '../../../shared/overlay-service/overlay.service';
import { selectSelectedColumnsForFeature, selectShowPassportColumnsOnly } from '../state/attribute-list.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { OverlayRef } from '../../../shared/overlay-service/overlay-ref';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { changeColumnPosition, toggleColumnVisible, toggleShowPassportColumns } from '../state/attribute-list.actions';

@Component({
  selector: 'tailormap-attribute-list-column-selection',
  templateUrl: './attribute-list-column-selection.component.html',
  styleUrls: ['./attribute-list-column-selection.component.css'],
})
export class AttributeListColumnSelectionComponent implements OnInit, OnDestroy {

  public columns: AttributeListColumnModel[];
  public showPassportColumnsOnly: boolean;

  private destroyed = new Subject();
  public hasPassportColumns: boolean;

  constructor(
    private store$: Store<AttributeListState>,
    private overlayRef: OverlayRef,
    @Inject(OVERLAY_DATA) private data: { featureType: number },
  ) { }

  public ngOnInit(): void {
    this.store$.select(selectSelectedColumnsForFeature, this.data.featureType)
      .pipe(takeUntil(this.destroyed))
      .subscribe(columns => {
        this.columns = [...columns];
        this.hasPassportColumns = this.columns.findIndex(c => c.columnType === 'passport') !== -1;
      });
    this.store$.select(selectShowPassportColumnsOnly, this.data.featureType)
      .pipe(takeUntil(this.destroyed))
      .subscribe(showPassportColumnsOnly => this.showPassportColumnsOnly = showPassportColumnsOnly);
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public closeOverlay() {
    this.overlayRef.close();
  }

  public trackByColumnId(index: number, column: AttributeListColumnModel) {
    return column.id;
  }

  public toggleCheckbox(column: AttributeListColumnModel) {
    this.store$.dispatch(toggleColumnVisible({
      featureType: this.data.featureType,
      columnId: column.id,
    }));
  }

  public drop($event: CdkDragDrop<AttributeListColumnModel>) {
    moveItemInArray(this.columns, $event.previousIndex, $event.currentIndex);
    const prevItem = $event.currentIndex === 0 ? null : this.columns[$event.currentIndex - 1].id;
    this.store$.dispatch(changeColumnPosition({
      featureType: this.data.featureType,
      columnId: $event.item.data.id,
      previousColumn: prevItem,
    }));
  }

  public toggleShowPassportColumns() {
    this.store$.dispatch(toggleShowPassportColumns({ featureType: this.data.featureType }));
  }

}
