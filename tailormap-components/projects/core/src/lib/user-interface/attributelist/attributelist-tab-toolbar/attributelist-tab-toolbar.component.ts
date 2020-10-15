
import {
  Component,
  OnInit
} from '@angular/core';

import { ExportService } from '../../../shared/export-service/export.service';
import { ExportFeaturesParameters } from '../../../shared/export-service/export-models'
import { Layer } from '../layer.model';
import { LayerService } from '../layer.service';

@Component({
  selector: 'tailormap-attributelist-tab-toolbar',
  templateUrl: './attributelist-tab-toolbar.component.html',
  styleUrls: ['./attributelist-tab-toolbar.component.css'],
})
export class AttributelistTabToolbarComponent implements OnInit {

  private layer: Layer;

  private exportParams: ExportFeaturesParameters= {
    application: 0,
    appLayer:0,
    type: ""
  };

  constructor(
      private exportService: ExportService,
      private layerService: LayerService) {
  }

  public ngOnInit(): void {
    this.exportParams.application = this.layerService.getAppId();
  }

  /**
   * @param {string} format - "CSV", "GEOJSON", "XLS", "SHP"
   */
  public onExportClick(format: string): void {
    this.exportParams.appLayer =  this.layer.id;
    this.exportParams.type = format;
    this.exportService.exportFeatures(this.exportParams).subscribe((response => {
      window.location.href = response.url;
    }), (error) => console.log('Error downloading the export:\n  '+ error.message),
      () => console.info('File exported successfully'));
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
