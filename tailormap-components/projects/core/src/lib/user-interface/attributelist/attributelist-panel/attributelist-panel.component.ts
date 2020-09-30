
import { Component, ElementRef, OnInit, AfterViewInit, ViewChild, Renderer2 } from '@angular/core';

import { MatToolbar } from '@angular/material/toolbar';
import { MatTabGroup } from '@angular/material/tabs';

import { Layer } from '../layer.model';
import { LayerService } from '../layer.service';
import { LayoutService } from '../../layout.service';
import { LayoutConfig } from '../../layout-config';
import { LayoutComponent } from '../../models';
import { Dock } from '../../enums';

import { PanelResizerComponent } from '../../panel-resizer/panel-resizer.component';
import { AttributeListParameters, AttributeListResponse,
         AttributeMetadataParameters, AttributeMetadataResponse } from '../../test-attributeservice/models';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { AppLayer } from '../../../../../../bridge/typings';

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

  // @ViewChild('tabgroup', { static: true, read: ElementRef }) private tabgroupElem: ElementRef<HTMLDivElement>;
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
    // console.log('#Panel.ngOnInit');
    // Set custom css style.
    //this.setCustomStyle();
    // Get the layers.
    this.getLayers();
  }

  public ngAfterViewInit(): void {
    // console.log('#Panel.ngAfterViewInit');
    // Set custom css style.
    this.setCustomStyle();
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
    let appId = 3;
    let layerId = 16;
    let featType = 0;
    let filter = '';

    // const layerName = 'wegvakonderdeel';
    // //const layerName = 'wegvakonderdeelplanning';
    // const layer = this.layerService.getLayerByName(layerName);
    // console.log(layer.id);
    // const appLayerId = this.layerService.getAppLayerId(appId,layerName);
    // console.log(appLayerId);

    // filter: "wegvakonderdeel_id = 'A0ABA09EB3F045AE80A293639EBEA701'"
    // foreignFeatureTypeName: "wegvakonderdeelplanning"
    // id: 170
    appId = 3;
    layerId = 170;
    featType = 0;
    filter = "wegvakonderdeel_id = 'A0ABA09EB3F045AE80A293639EBEA701'";

    const metaParams: AttributeMetadataParameters = {
      application: appId,
      appLayer: layerId,
    };
    const params: AttributeListParameters = {
      application: appId,
      appLayer: layerId,
      featureType: featType,
      dir: 'ASC',
      //sort: 'verhardingsfunctie',
      sort: '',
      filter: filter,
    };

    this.attributeService.featureTypeMetadata$(metaParams).subscribe(
      (metaData: AttributeMetadataResponse) => {
        console.log(metaData);
        this.attributeService.features$(params).subscribe(
          (data: AttributeListResponse) => console.log(data)
        );
      }
    );

    // this.attributeService.featureTypeMetadata$(metaParams).subscribe(
    //   (data: AttributeMetadataResponse) => console.log(data)
    // );
    // this.attributeService.features$(params).subscribe(
    //   (data: AttributeListResponse) => console.log(data)
    // );

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

  /**
   * Sets custom css style for dom elements which style cannot been set in
   * the css file.
   */
  private setCustomStyle(): void {
    // console.log('Panel.setCustomStyle');
    // const parentElem = this.elementRef.nativeElement;
    // const elems = parentElem.getElementsByClassName('mat-tab-body-content');
    // console.log(elems);
    // // if (!!elems) {
    // if (elems) {
    //   console.log('Panel.setCustomStyle - for.....');
    //   for (let i = 0; i < elems.length; i++) {
    //     this.renderer.setStyle(elems[i], 'overflow', 'auto');
    //     this.renderer.setStyle(elems[i], 'flex', '1');
    //     this.renderer.setStyle(elems[i], 'display', 'flex');
    //     this.renderer.setStyle(elems[i], 'flex-flow', 'column nowrap');
    //   }
    // }
  }
}
