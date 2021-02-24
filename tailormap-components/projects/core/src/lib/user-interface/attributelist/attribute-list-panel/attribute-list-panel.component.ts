import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { MatToolbar } from '@angular/material/toolbar';
import { LayoutService } from '../../layout.service';
import { LayoutConfig } from '../../layout-config';
import { LayoutComponent } from '../../models';
import { Dock } from '../../enums';

import { PanelResizerComponent } from '../../panel-resizer/panel-resizer.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { setAttributeListVisibility, setSelectedTab } from '../state/attribute-list.actions';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { selectAttributeListConfig, selectAttributeListTabs } from '../state/attribute-list.selectors';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';
import { PopoverPositionEnum } from '../../../shared/popover/models/popover-position.enum';
import { AttributeListColumnSelectionComponent } from '../attribute-list-column-selection/attribute-list-column-selection.component';
import { PopoverService } from '../../../shared/popover/popover.service';
import { OverlayRef } from '../../../shared/overlay-service/overlay-ref';

@Component({
  selector: 'tailormap-attribute-list-panel',
  templateUrl: './attribute-list-panel.component.html',
  styleUrls: ['./attribute-list-panel.component.css'],
})
export class AttributeListPanelComponent implements OnInit, AfterViewInit, LayoutComponent {

  // For the layout service.
  @ViewChild('captionbar')
  public captionbar: MatToolbar;

  @ViewChild('panelResizer')
  public panelResizer: PanelResizerComponent;

  public layoutConfig: LayoutConfig;
  public tabs: AttributeListTabModel[];

  // The height of the caption bar.
  private captionbarHeight = 30;
  private destroyed = new Subject();

  private columnSelectionOverlayRef: OverlayRef;
  public title$: Observable<string>;

  constructor(
    private store$: Store<AttributeListState>,
    private elementRef: ElementRef,
    private layoutService: LayoutService,
    private popoverService: PopoverService,
  ) {
  }

  public ngOnInit(): void {
    this.store$.select(selectAttributeListTabs)
      .pipe(takeUntil(this.destroyed))
      .subscribe(tabs => {
        this.tabs = tabs;
      });
    this.title$ = this.store$.select(selectAttributeListConfig)
      .pipe(map(config => config.title || 'Attributenlijst'));
  }

  public ngAfterViewInit(): void {
    // console.log('#Panel.ngAfterViewInit');
    // Set layout config settings.
    this.layoutConfig = new LayoutConfig(this.elementRef, this.panelResizer);
    this.layoutConfig.dock = Dock.Bottom;
    // this.layoutConfig.initialHeight = 300;
    // this.layoutConfig.initialHeight = 250;
    this.layoutConfig.initialHeight = 350;
    // Register panel.
    this.layoutService.register(this);
  }

  public getCaptionbarHeight(): number {
    return this.captionbarHeight;
  }

  public onMaximizeClick(): void {
    this.layoutService.maximize(this);
  }

  public onMinimizeClick(): void {
    this.layoutService.minimize(this);
  }

  public onCloseClick(): void {
    this.store$.dispatch(setAttributeListVisibility({visible: false}));
  }

  public onSelectedTabChange($event: MatTabChangeEvent): void {
    this.store$.dispatch(setSelectedTab({ layerId: this.tabs[$event.index].layerId }));
  }

  public trackByLayerId(layer) {
    return layer.id;
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
}
