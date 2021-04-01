import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import {
  selectAttributeListConfig, selectAttributeListHeight, selectAttributeListTabs, selectAttributeListVisible,
} from '../state/attribute-list.selectors';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { setAttributeListVisibility, setSelectedTab, updateAttributeListHeight } from '../state/attribute-list.actions';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { AttributeListColumnSelectionComponent } from '../attribute-list-column-selection/attribute-list-column-selection.component';
import { PopoverPositionEnum } from '../../../shared/popover/models/popover-position.enum';
import { OverlayRef } from '../../../shared/overlay-service/overlay-ref';
import { PopoverService } from '../../../shared/popover/popover.service';

@Component({
  selector: 'tailormap-attribute-list',
  templateUrl: './attribute-list.component.html',
  styleUrls: ['./attribute-list.component.css'],
})
export class AttributeListComponent {

  public isVisible$: Observable<boolean>;

  public tabs: AttributeListTabModel[];
  private destroyed = new Subject();

  private columnSelectionOverlayRef: OverlayRef;
  public title$: Observable<string>;
  public height: number;
  public minimized = false;
  public maximized = false;

  constructor(
    private store$: Store<AttributeListState>,
    private popoverService: PopoverService,
  ) {
    this.isVisible$ = this.store$.select(selectAttributeListVisible);
    this.store$.select(selectAttributeListTabs)
      .pipe(takeUntil(this.destroyed))
      .subscribe(tabs => {
        this.tabs = tabs;
      });
    this.title$ = this.store$.select(selectAttributeListConfig)
      .pipe(map(config => config.title || 'Attributenlijst'));
    this.store$.select(selectAttributeListHeight)
      .pipe(takeUntil(this.destroyed))
      .subscribe(height => this.height = height);
  }

  public onMaximizeClick(): void {
    this.maximized = !this.maximized;
    if (this.maximized) {
      this.minimized = false;
    }
  }

  public onMinimizeClick(): void {
    this.minimized = !this.minimized;
    if (this.minimized) {
      this.maximized = false;
    }
  }

  public onCloseClick(): void {
    this.store$.dispatch(setAttributeListVisibility({visible: false}));
  }

  public onSelectedTabChange($event: MatTabChangeEvent): void {
    this.store$.dispatch(setSelectedTab({ layerId: this.tabs[$event.index].layerId }));
  }

  public trackByLayerId(idx: number, layer: AttributeListTabModel) {
    return layer.layerId;
  }

  public openColumnSelection($event: MouseEvent, tab: AttributeListTabModel) {
    if (this.columnSelectionOverlayRef && this.columnSelectionOverlayRef.isOpen) {
      this.columnSelectionOverlayRef.close();
    }
    const WINDOW_WIDTH = 300;
    this.columnSelectionOverlayRef = this.popoverService.open({
      origin: $event.currentTarget as HTMLElement,
      content: AttributeListColumnSelectionComponent,
      data: { featureType: tab.selectedRelatedFeatureType || tab.featureType },
      height: 250,
      width: Math.min(WINDOW_WIDTH, window.innerWidth),
      closeOnClickOutside: true,
      position: PopoverPositionEnum.BOTTOM_RIGHT_DOWN,
      positionOffset: 10,
    });
  }

  public sizeChanged(changedHeight: number) {
    let initialHeight = this.height;
    if (this.minimized) {
      initialHeight = 0;
    }
    if (this.maximized) {
      initialHeight = window.innerHeight;
    }
    this.minimized = false;
    this.maximized = false;
    this.store$.dispatch(updateAttributeListHeight({ height: initialHeight - changedHeight }));
  }

}
