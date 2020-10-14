
import {
  Component,
  OnInit,
  Renderer2,
} from '@angular/core';
// import { AttributeDataSource } from '../attributelist-common/attributelist-datasource';
import { AttributelistTabComponent } from '../attributelist-tab/attributelist-tab.component';
import { AttributelistTableComponent } from '../attributelist-table/attributelist-table.component';
import { AttributeService } from '../../../shared/attribute-service/attribute.service';
import { LayerService } from '../layer.service';
import { ExportService } from '../../../shared/export-service/export.service';
import { ExportFeaturesParameters } from '../../../shared/export-service/export-models'
import { PassportService } from '../passport.service';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'tailormap-attributelist-tab-toolbar',
  templateUrl: './attributelist-tab-toolbar.component.html',
  styleUrls: ['./attributelist-tab-toolbar.component.css'],
})
export class AttributelistTabToolbarComponent implements OnInit {

  // The params for export
  private exportParams: ExportFeaturesParameters= {
    application: 0,
    appLayer:0,
    type: ""
  };

  // public dataSource = new AttributeDataSource(this.layerService,
  //   this.attributeService,
  //   // this.exportService,
  //   this.passportService);

  public attibuteListTabComponent = new AttributelistTabComponent(this.layerService);

  public attributelistTableComponent = new AttributelistTableComponent(this.attributeService, this.layerService, this.exportService, this.passportService, this.dialog, this.renderer )
  constructor(
    private attributeService: AttributeService,
    private layerService: LayerService,
    private exportService: ExportService,
    private passportService: PassportService,
    private dialog: MatDialog,
    private renderer: Renderer2) {
  }

  public ngOnInit(): void {
    this.exportParams.application = this.layerService.getAppId();
  }

  public onExportClick(format: string): void {
    alert('In development, trying export to: ' + format);
    //this.attributeDataSource.exportFeatures (format)
    this.exportParams.appLayer =  this.attributelistTableComponent.getLayerIdOnTab(this.attibuteListTabComponent.tabIndex);
    this.exportParams.type = format;
    this.exportService.exportFeatures(this.exportParams);
  }

  public onFilterClick(): void {
    alert('Not yet implemented.');
  }

  public onSearchClick(): void {
    alert('Not yet implemented.');
  }
}
