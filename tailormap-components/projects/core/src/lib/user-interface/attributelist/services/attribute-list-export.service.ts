import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectActiveColumnsForFeature } from '../state/attribute-list.selectors';
import { catchError, concatMap, map, take } from 'rxjs/operators';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { ExportFeaturesParameters } from '../../../shared/export-service/export-models';
import { of } from 'rxjs';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { ExportService } from '../../../shared/export-service/export.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export type ExportType = 'CSV' | 'GEOJSON' | 'XLS' | 'SHP';

@Injectable({
  providedIn: 'root',
})
export class AttributeListExportService {

  constructor(
    private store$: Store<AttributeListState>,
    private tailorMapService: TailorMapService,
    private exportService: ExportService,
    private snackBar: MatSnackBar,
  ) {}

  public createAttributeListExport(format: ExportType, layerId: string, featureType: number) {
    this.store$.select(selectActiveColumnsForFeature, featureType)
      .pipe(
        take(1),
        map<AttributeListColumnModel[], ExportFeaturesParameters>(columns => ({
          application: this.tailorMapService.getApplicationId(),
          appLayer: +(layerId),
          featureType,
          type: format,
          columns: columns.map(c => c.name),
        })),
        concatMap(exportParams => {
          return this.exportService.exportFeatures$(exportParams).pipe(
            catchError(() => {
              this.snackBar.open('Error downloading the ' + exportParams.type + ' export\n', 'Close', {
                duration: 20000,
              });
              return of(null);
            }),
          );
        }),
      )
      .subscribe(response => {
        if (response && response.url) {
          window.location.href = response.url;
        }
      });
  }

}
