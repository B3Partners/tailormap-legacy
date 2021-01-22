
import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';

import { MatToolbar } from '@angular/material/toolbar';

import { Layer } from '../layer.model';
import { LayerService } from '../layer.service';
import { LayoutService } from '../../layout.service';
import { LayoutConfig } from '../../layout-config';
import { LayoutComponent } from '../../models';
import { Dock } from '../../enums';

import { PanelResizerComponent } from '../../panel-resizer/panel-resizer.component';
import { RowClickData } from '../attributelist-common/attributelist-models';
import {
  MatTabGroup,
} from '@angular/material/tabs';
import { HighlightService } from '../../../shared/highlight-service/highlight.service';
import { Store } from '@ngrx/store';
import { AttributelistState } from '../state/attributelist.state';
import { setAttributelistVisibility } from '../state/attributelist.actions';
import { selectApplicationTreeWithoutBackgroundLayers, selectVisibleLayers } from '../../../application/state/application.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LayerUtils } from '../../../shared/layer-utils/layer-utils.service';

@Component({
  selector: 'tailormap-attributelist-panel',
  templateUrl: './attributelist-panel.component.html',
  styleUrls: ['./attributelist-panel.component.css'],
})
export class AttributelistPanelComponent implements OnInit, AfterViewInit, LayoutComponent {

  // For the layout service.
  @ViewChild('captionbar') public captionbar: MatToolbar;
  @ViewChild('panelResizer') public panelResizer: PanelResizerComponent;

  // For the layout service.
  public layoutConfig: LayoutConfig;

  // For getting the selected tab index.
  @ViewChild('tabgroup') private tabgroup: MatTabGroup;

  @Output()
  public pageChange = new EventEmitter();

  @Output()
  public panelClose = new EventEmitter();

  @Output()
  public rowClick = new EventEmitter<RowClickData>();

  @Output()
  public tabChange = new EventEmitter();

  // Is used in the template. Generates for each layer a tab.
  public layers: Layer[];

  // The height of the caption bar.
  private captionbarHeight = 30;

  private destroyed = new Subject();

  constructor(
    private store$: Store<AttributelistState>,
    private elementRef: ElementRef,
    private layerService: LayerService,
    private highlightService: HighlightService,
    private layoutService: LayoutService,
  ) {
  }

  public ngOnInit(): void {
    this.store$.select(selectVisibleLayers)
      .pipe(takeUntil(this.destroyed))
      .subscribe(layers => {
        this.layers = layers.filter(layer => layer.attribute).map<Layer>(layer => ({
          id: +(layer.id),
          alias: layer.alias,
          name: LayerUtils.sanitizeLayername(layer.layerName),
        }));
      });
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

  public onCloseClick(): void {
    this.store$.dispatch(setAttributelistVisibility({ visible: false }));
    // Clear highligthing.
    this.highlightService.clearHighlight();
  }

  public onMaximizeClick(): void {
    this.layoutService.maximize(this);
  }

  public onMinimizeClick(): void {
    this.layoutService.minimize(this);
  }

  public onPageChange(): void {
    this.pageChange.emit();
  }

  public onRowClick(data: RowClickData): void {
    this.rowClick.emit(data);
  }

  public onSelectedTabChange(): void {
    this.tabChange.emit();
    // Clear highligthing.
    this.highlightService.clearHighlight();
  }

  public trackByLayerId(layer) {
    return layer.id;
  }

  /**
   * Fired when clicked on the icon in a tab.
   */
  public onTableOptionsClick(evt: MouseEvent, iconIndex: number): void {

    // Get the current active tab index.
    const currentIndex = this.tabgroup.selectedIndex;

    // Are current and clicked index NOT equal?
    if (currentIndex !== iconIndex) {
      // Ignore.
      return;
    }

    // Correct icon clicked. Get the corresponding tab component.
    const tab = this.layerService.getTabComponent(currentIndex);
    // Found?
    if (tab !== null) {
      tab.table.onTableOptionsClick(evt);
    }
  }

}
