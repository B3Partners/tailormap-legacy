
import { Component, OnInit } from '@angular/core';

import { Layer } from '../layer.model';
import { LayerService } from '../layer.service';

@Component({
  selector: 'tailormap-attributelist-tab-toolbar',
  templateUrl: './attributelist-tab-toolbar.component.html',
  styleUrls: ['./attributelist-tab-toolbar.component.css'],
})
export class AttributelistTabToolbarComponent implements OnInit {

  private layer: Layer;

  constructor(private layerService: LayerService) {
  }

  public ngOnInit(): void {
  }

  /**
   * @param format      Can be "csv" or "json".
   */
  public onExportClick(format: string): void {
    // const layerId = this.layer.id;
    // const layerName = this.layer.name;
    // console.log(layerId);
    alert('Not yet implemented.');
  }

  public onFilterClick(): void {
    alert('Not yet implemented.');
  }

  public onSearchClick(): void {
    alert('Not yet implemented.');
  }

  public setTabIndex(tabIndex: number): void {
    // Get the corresponding layer.
    this.layer = this.layerService.getLayerByTabIndex(tabIndex);
  }
}
