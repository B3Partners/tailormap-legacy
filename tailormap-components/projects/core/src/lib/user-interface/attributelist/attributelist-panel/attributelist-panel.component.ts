
import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, Renderer2 } from '@angular/core';

import { MatToolbar } from '@angular/material/toolbar';
import { MatTabGroup } from '@angular/material/tabs';

import { Layer } from '../layer.model';
import { LayerService } from '../layer.service';
import { LayoutService } from '../../layout.service';
import { LayoutConfig } from '../../layout-config';
import { LayoutComponent } from '../../models';
import { Dock } from '../../enums';

import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { PanelResizerComponent } from '../../panel-resizer/panel-resizer.component';
import { Test } from '../test';

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

  @ViewChild(MatTabGroup, { static: true, read: ElementRef }) private tabgroupElem: ElementRef<HTMLDivElement>;

  // For getting the selected tab index.
  @ViewChild('tabgroup') private tabgroup;

  // Is used in the template. Generates for each layer a tab.
  public layers: Layer[];

  // The height of the caption bar.
  private captionbarHeight = 30;

  constructor(private elementRef: ElementRef,
              private layerService: LayerService,
              private layoutService: LayoutService,
              private attributeService: AttributeService,
              private renderer: Renderer2) {
  }

  public ngOnInit(): void {
    // Get the layers.
    this.getLayers();
  }

  public ngAfterViewInit(): void {
    // console.log('#Panel.ngAfterViewInit');
    // Set layout config settings.
    this.layoutConfig = new LayoutConfig(this.elementRef, this.panelResizer);
    this.layoutConfig.dock = Dock.Bottom;
    this.layoutConfig.initialHeight = 300;
    this.layoutConfig.initialHeight = 250;
    this.layoutConfig.initialHeight = 350;
    // Register panel.
    this.layoutService.register(this);
  }

  public getCaptionbarHeight(): number {
    return this.captionbarHeight;
  }

  /**
   * https://phpenthusiast.com/blog/develop-angular-php-app-getting-the-list-of-items
   */
  public getLayers(): void {
    this.layerService.getLayers$().subscribe(
      (data: Layer[]) => {
        this.layers = data;
        // console.log('#Panel - getLayers');
        // console.log(this.layers);
      },
    );
  }

  public onCloseClick(): void {
    this.show(false);
    // this.layoutService.close(this);
  }

  public onMaximizeClick(): void {
    this.layoutService.maximize(this);
  }

  public onMinimizeClick(): void {
    this.layoutService.minimize(this);
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

  public onTestClick(): void {
    console.log("# Test - WegvakonderdeelPlanning");
    Test.getAttrWegvakonderdeelPlanning(this.attributeService);
  }

  /**
   * Shows of hides the panel.
   *
   * Remark:
   *   Using a div with *ngIf in the template consumes space on the page
   *   even when the panel is not visible.
   */
  public show(show: boolean): void {
    const domElem = this.elementRef.nativeElement;
    if (show) {
      domElem.style.display = 'block';
    } else {
      domElem.style.display = 'none';
    }
  }
}
