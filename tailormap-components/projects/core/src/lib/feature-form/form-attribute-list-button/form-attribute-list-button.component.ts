import { Component, OnDestroy } from '@angular/core';
import { AttributeListService } from '@tailormap/core-components';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import * as wellknown from 'wellknown';
import { Feature } from '../../shared/generated';
import { map, take, takeUntil } from 'rxjs/operators';
import { combineLatest, Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { editFeatures } from '../../application/state/application.actions';

@Component({
  selector: 'tailormap-form-attribute-list-button',
  templateUrl: './form-attribute-list-button.component.html',
  styleUrls: ['./form-attribute-list-button.component.css'],
})
export class FormAttributeListButtonComponent implements OnDestroy {

  public canOpenForm: boolean;

  private destroyed = new Subject();

  constructor(
    private tailorMapService: TailorMapService,
    private attributeListService: AttributeListService,
    private store$: Store,
  ) {
    this.attributeListService.getCheckedRows$()
      .pipe(
        takeUntil(this.destroyed),
        map(rows => rows.length),
      )
      .subscribe(rowCount => {
        this.canOpenForm = rowCount > 0;
      });
  }

  public static registerWithAttributeList(attributeListService: AttributeListService) {
    attributeListService.registerComponent(FormAttributeListButtonComponent);
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public openPassportForm(): void {
    this.getCheckedRowsAsFeatures$()
      .pipe(
        take(1),
      )
      .subscribe(result => {
        if (result.features.length === 0) {
          return;
        }
        this.store$.dispatch(editFeatures({ features: result.features, layerId: result.layerId }));
      });
  }

  private getCheckedRowsAsFeatures$(): Observable<{ features: Feature[]; layerId: string }> {
    return combineLatest([
      this.attributeListService.getCheckedRows$(),
      this.attributeListService.getSelectedLayerId$(),
    ])
      .pipe(
        take(1),
        map(([ rows, layerId ]) => {
          return {
            layerId,
            features: rows.map(row => {
              // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
              const { object_guid, related_featuretypes, __fid, _checked, _expanded, _selected, rowId, geometrie, ...rest } = row;
              if (row.geometrie) {
                rest.geometrie =  wellknown.parse(row.geometrie);
              }
              const feature = {} as Feature;
              const appLayer = this.tailorMapService.getApplayerById(+(layerId));
              const className = appLayer.layerName;
              feature.children = [];
              feature.layerName = className;
              feature.fid = row.object_guid;
              feature.relatedFeatureTypes = row.related_featuretypes;
              feature.tableName = className[0].toUpperCase() + className.substr(1);
              return ({ ...feature, ...rest });
            }),
          };
        }),
      );
  }

}
