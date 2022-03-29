import { Component, Inject, OnDestroy } from '@angular/core';
import { METADATA_SERVICE } from '@tailormap/api';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { forkJoin, of, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MetadataService } from '../../application/services/metadata.service';
import { UserLayerService } from '../services/user-layer.service';
import { UserLayerHelper } from '../helpers/user-layer.helper';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { AnalysisAttributeListLayerNameChooserComponent } from '../analysis-attribute-list-layername-chooser/analysis-attribute-list-layer-name-chooser.component';
import { AttributeListService } from '@tailormap/core-components';

@Component({
  selector: 'tailormap-analysis-attribute-list-button',
  templateUrl: './analysis-attribute-list-button.component.html',
  styleUrls: ['./analysis-attribute-list-button.component.css'],
})
export class AnalysisAttributeListButtonComponent implements OnDestroy {

  private destroyed = new Subject();
  private layerId: string;
  private creatingLayerSnackbar: MatSnackBarRef<TextOnlySnackBar>;

  constructor(
    private tailorMapService: TailorMapService,
    private attributeListService: AttributeListService,
    private dialog: MatDialog,
    @Inject(METADATA_SERVICE) private metadataService: MetadataService,
    private userLayerService: UserLayerService,
    private snackBar: MatSnackBar,
  ) {
    this.attributeListService.getSelectedLayerId$()
      .pipe(
        takeUntil(this.destroyed),
      )
      .subscribe(layerId => {
        this.layerId = layerId;
      });
  }

  public getToolTipMessageForUserLayer(): string {
    if (this.tailorMapService.getApplayerById(+(this.layerId)).userlayer) {
      return 'Er kunnen geen selectielagen op basis van andere selectielagen gemaakt worden';
    } else if(!this.tailorMapService.getFilterString(+(this.layerId), false)) {
      return 'Stel eerst een filter in op de attributenlijst om een laag te kunnen publiceren';
    } else if(this.hasExternalFilters()) {
      return 'Er kan alleen een laag gemaakt worden op basis van attributenlijst filters. Reset andere filters zoals het ruimtelijk filter.';
    } else {
      return '';
    }
  }

  public getCanCreateUserLayer(): boolean {
    return !(this.tailorMapService.getApplayerById(+(this.layerId)).userlayer
      || !this.tailorMapService.getFilterString(+(this.layerId), false)
      || this.hasExternalFilters());
  }

  private hasExternalFilters(): boolean {
    return !!this.tailorMapService.getFilterString(+(this.layerId));
  }

  public static registerWithAttributeList(attributeListService: AttributeListService) {
    attributeListService.registerComponent(AnalysisAttributeListButtonComponent);
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public createUserLayer(): void {
    if (!this.getCanCreateUserLayer()) {
      return;
    }
    const query = this.tailorMapService.getFilterString(+(this.layerId), false);
    const dialogRef = this.dialog.open(AnalysisAttributeListLayerNameChooserComponent, {
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
          ]);
        }),
        switchMap(([ result, attributeMetadata ]) => {
          const appLayerId = +(this.layerId);
          const appLayer = this.tailorMapService.getApplayerById(appLayerId);
          this.creatingLayerSnackbar = this.snackBar.open(`Bezig met gebruikerslaag ${result} aanmaken`);
          return this.userLayerService.createUserLayerFromParams$({
            appLayerId: `${appLayerId}`,
            title: result,
            query,
            source: UserLayerHelper.createUserLayerSourceFromMetadata(attributeMetadata, appLayer),
          });
        }),
      )
      .subscribe(() => {
        this.creatingLayerSnackbar.dismiss();
      });
  }

}
