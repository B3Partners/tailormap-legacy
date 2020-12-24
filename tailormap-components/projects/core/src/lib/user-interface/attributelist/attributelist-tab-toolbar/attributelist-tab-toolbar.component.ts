import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AttributelistColumn } from '../attributelist-common/attributelist-column-models';
import { ExportService } from '../../../shared/export-service/export.service';
import { ExportFeaturesParameters } from '../../../shared/export-service/export-models';
import { Layer } from '../layer.model';
import { LayerService } from '../layer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttributelistTabComponent } from '../attributelist-tab/attributelist-tab.component';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../../../analysis/state/analysis.state';
import { setSelectedDataSource } from '../../../analysis/state/analysis.actions';
import { UserLayerService } from '../../../analysis/services/user-layer.service';
import { AnalysisSourceModel } from '../../../analysis/models/analysis-source.model';
import { AttributeTypeHelper } from '../../../application/helpers/attribute-type.helper';
import { MetadataService } from '../../../application/services/metadata.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AttributelistLayernameChooserComponent } from '../attributelist-layername-chooser/attributelist-layername-chooser.component';

@Component({
  selector: 'tailormap-attributelist-tab-toolbar',
  templateUrl: './attributelist-tab-toolbar.component.html',
  styleUrls: ['./attributelist-tab-toolbar.component.css'],
})
export class AttributelistTabToolbarComponent implements OnInit, OnDestroy {

  @Input()
  public tab: AttributelistTabComponent;

  private layer: Layer;

  public columns: AttributelistColumn[];
  private destroyed = new Subject();

  private exportParams: ExportFeaturesParameters = {
    application: 0,
    appLayer: 0,
    columns: [],
    type: '',
  };

  constructor(
    private exportService: ExportService,
    private userLayer: UserLayerService,
    private layerService: LayerService,
    private tailorMapService: TailorMapService,
    public dialog: MatDialog,
    private store$: Store<AnalysisState>,
    private metadataService: MetadataService,
    private _snackBar: MatSnackBar) {
  }

  public ngOnInit(): void {
    this.exportParams.application = this.layerService.getAppId();
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
   * format = 'CSV', 'GEOJSON', 'XLS', 'SHP'
   */
  public onExportClick(format: string): void {
    this.exportParams.appLayer = this.layer.id;
    this.exportParams.type = format;
    this.exportParams.columns = [];
    this.columns = this.tab.table.getActiveColumns(false);
    this.columns.forEach(c => {
      if (c.visible) {
        this.exportParams.columns.push(c.name);
      }
    });
    this.exportService.exportFeatures(this.exportParams).takeUntil(this.destroyed).pipe(takeUntil(this.destroyed)).subscribe((response => {
      window.location.href = response.url;
    }), () => this._snackBar.open('Error downloading the ' + this.exportParams.type + ' export\n', 'Close', {
      duration: 20000,
    }))
  }

  public createUserlayer(): void {
      const dialogRef = this.dialog.open(AttributelistLayernameChooserComponent, {
        width: '250px',
        data: {},
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('The dialog was closed');
          const appLayerId = this.layer.id;
          const appLayer = this.tailorMapService.getApplayerById(appLayerId);
          const layerName = result;

          this.metadataService.getFeatureTypeMetadata$(appLayer.id).pipe(takeUntil(this.destroyed)).subscribe(attributeMetadata => {
            const geomAttribute = attributeMetadata.attributes[attributeMetadata.geometryAttributeIndex];
            let geometryType;
            if (geomAttribute) {
              geometryType = AttributeTypeHelper.getGeometryAttributeType(geomAttribute);
            }
            const source: AnalysisSourceModel = {
              layerId: +(appLayer.id),
              featureType: appLayer.featureType,
              label: appLayer.alias,
              geometryType,
              geometryAttribute: geomAttribute.name,
            };
            this.store$.dispatch(setSelectedDataSource({source}));
            this.tailorMapService.applicationConfig$.pipe(takeUntil(this.destroyed)).subscribe(app => {
              this.userLayer.createUserLayerFromParams('' + appLayerId, layerName, appLayer.filter.getCQL(), null);
            });
          });
        }
      });


  }

  public onClearFilterClick(): void {
    this.tab.table.onClearFilter();
  }

  public onSearchClick(): void {
    alert('Not yet implemented.');
  }

  public setTabIndex(tabIndex: number): void {
    // Get the corresponding layer.
    this.layer = this.layerService.getLayerByTabIndex(tabIndex);
  }
}
