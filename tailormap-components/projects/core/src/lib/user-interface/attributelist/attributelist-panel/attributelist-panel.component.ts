/**============================================================================
 *===========================================================================*/

import { Component, ElementRef, OnInit, AfterViewInit, ViewChild,
         Renderer2, HostBinding} from '@angular/core';

import {ILayer} from '../layer.model';
import {LayerService} from '../layer.service';
import {LayoutService, ILayoutComponent, Dock, WindowState} from '../../panel-resizer/layout.service';

import {PanelResizerComponent} from '../../panel-resizer/panel-resizer.component';

import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'tailormap-attributelist-panel',
  templateUrl: './attributelist-panel.component.html',
  styleUrls: ['./attributelist-panel.component.css']
})
export class AttributelistPanelComponent implements OnInit, AfterViewInit, ILayoutComponent {

  // For the layout service.
  @ViewChild('captionbar') captionbar: MatToolbar;
  @ViewChild("panelResizer") panelResizer: PanelResizerComponent;

  // For the layout service.
  // TODO: DIT IN EEN APARTE STRUCTURE/CLASS???
  canResize = true;
  componentRef = this.elementRef;
  dock = Dock.Bottom;
  initialHeight = 300;
  windowState = WindowState.Initial;

  // For getting the selected tab index.
  @ViewChild("tabgroup") tabgroup;

  // For showing/hiding the panel.
  @HostBinding("style.display") cssDisplay: string;

  layers: ILayer[];

  // The height of the caption bar.
  private captionbarHeight = 30;

  /**----------------------------------------------------------------------------
   */
  constructor(private elementRef: ElementRef,
              private layerService: LayerService,
              private layoutService: LayoutService,
              private renderer: Renderer2) {
  }
  /**----------------------------------------------------------------------------
   */
  ngOnInit(): void {
    console.log("#Panel.ngOnInit");
    // Register panel.
    this.layoutService.register(this);
    // Set custom css style.
    this.setCustomStyle();
    // Get the layers.
    this.getLayers();
  }
  /**----------------------------------------------------------------------------
   */
  ngAfterViewInit(): void {
  }
  /**----------------------------------------------------------------------------
   */
  getCaptionbarHeight(): number {
    return this.captionbarHeight;
  }
  /**----------------------------------------------------------------------------
   * https://phpenthusiast.com/blog/develop-angular-php-app-getting-the-list-of-items
   */
  getLayers(): void {
    this.layerService.getRows().subscribe(
        (data: ILayer[]) => {
          this.layers = data;
        }
    );
  }
  /**----------------------------------------------------------------------------
   */
  onCloseClick(): void {
    this.show(false);
    //this.layoutService.close(this);
  }
  /**----------------------------------------------------------------------------
   */
  onMaximizeClick(): void {
    this.layoutService.maximize(this);
  }
  /**----------------------------------------------------------------------------
   */
  onMinimizeClick(): void {
    this.layoutService.minimize(this);
  }
  /**----------------------------------------------------------------------------
   * Fired when clicked on the icon in a tab.
   */
  onTableOptionsClick(evt: MouseEvent, iconIndex: number): void {

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
  /**----------------------------------------------------------------------------
   */
  onTestClick(): void {
  }
  /**----------------------------------------------------------------------------
   */
  public show(show: boolean): void {
    if (show) {
      this.cssDisplay = "block";
    } else {
      this.cssDisplay = "none";
    }
  }
  /**----------------------------------------------------------------------------
   * Sets custom css style for dom elements which style cannot been set in
   * the css file.
   */
  setCustomStyle(): void {
    // console.log("Panel.setCustomStyle");
    // // Get parent dom element, i.e. the dialog container.
    // const dlgDomElem = this.elementRef.nativeElement.parentElement;
    // //this.renderer.setStyle(dlgDomElem, 'background', 'red');
    // this.renderer.setStyle(dlgDomElem, 'padding', '0px');
  }
}
