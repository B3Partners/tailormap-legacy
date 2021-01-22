import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AttributelistColumn } from '../attributelist-common/attributelist-column-models';
import { ExportService } from '../../../shared/export-service/export.service';
import { ExportFeaturesParameters } from '../../../shared/export-service/export-models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttributelistTabComponent } from '../attributelist-tab/attributelist-tab.component';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { UserLayerService } from '../../../analysis/services/user-layer.service';
import { MetadataService } from '../../../application/services/metadata.service';
import { forkJoin, of, Subject } from 'rxjs';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AttributelistLayernameChooserComponent } from '../attributelist-layername-chooser/attributelist-layername-chooser.component';
import { UserLayerHelper } from '../../../analysis/helpers/user-layer.helper';

@Component({
  selector: 'tailormap-attributelist-tab-toolbar',
  templateUrl: './attributelist-tab-toolbar.component.html',
  styleUrls: ['./attributelist-tab-toolbar.component.css'],
})
export class AttributelistTabToolbarComponent implements OnInit, OnDestroy {

  @Input()
  public tab: AttributelistTabComponent;

  @Input()
  public layerId: number;

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
    private tailorMapService: TailorMapService,
    public dialog: MatDialog,
    private metadataService: MetadataService,
    private _snackBar: MatSnackBar) {
  }

  public ngOnInit(): void {
    this.exportParams.application = this.tailorMapService.getApplicationId();
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /**
   * format = 'CSV', 'GEOJSON', 'XLS', 'SHP'
   */
  public onExportClick(format: string): void {
    this.exportParams.appLayer = this.layerId;
    this.exportParams.type = format;
    this.exportParams.columns = [];
    this.columns = this.tab.table.getActiveColumns(false);
    this.columns.forEach(c => {
      if (c.visible) {
        this.exportParams.columns.push(c.name);
      }
    });
    this.exportService.exportFeatures(this.exportParams).pipe(takeUntil(this.destroyed)).subscribe((response => {
      window.location.href = response.url;
    }), () => this._snackBar.open('Error downloading the ' + this.exportParams.type + ' export\n', 'Close', {
      duration: 20000,
    }))
  }

  public isUserLayer(): boolean {
    return this.layerId && this.tailorMapService.getApplayerById(this.layerId).userlayer;
  }

  public isRelations(): boolean {
    let isRel = false;
    if (this.tab.table) {
      isRel = this.tab.table.isRelatedFeatures();
    }
    return isRel;
  }

  public createUserlayer(): void {
      const dialogRef = this.dialog.open(AttributelistLayernameChooserComponent, {
        width: '250px',
        data: {},
      });

      dialogRef.afterClosed()
        .pipe(
          filter(result => !!result),
          switchMap(result => {
            return forkJoin([
              of(result),
              this.metadataService.getFeatureTypeMetadata$(this.layerId),
              this.tailorMapService.applicationConfig$.pipe(take(1)),
            ]);
          }),
        )
        .subscribe(([ result, attributeMetadata, config ]) => {
          const appLayerId = this.layerId;
          const appLayer = this.tailorMapService.getApplayerById(appLayerId);
          this.userLayer.createUserLayerFromParams({
            appLayerId: `${appLayerId}`,
            title: result,
            query: appLayer.filter.getCQL(),
            source: UserLayerHelper.createUserLayerSourceFromMetadata(attributeMetadata, appLayer),
          });
        });


  }

  public onClearLayerFilterClick(): void {
    this.tab.table.onClearLayerFilter();
  }

  public onClearAllFilterClick(): void {
    this.tab.table.onClearAllFilters();
  }

  public onSearchClick(): void {
    alert('Not yet implemented.');
  }

  public openAttributeTree(): void {
    this.tab.table.openDialog();
  }

  public openPassportForm(): void {
    this.tab.table.openPassportDialog();
  }
}
