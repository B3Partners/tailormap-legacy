import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AttributeListColumnModel } from '../models/attribute-list-column-models';
import { ExportFeaturesParameters } from '../../../shared/export-service/export-models';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { UserLayerService } from '../../../analysis/services/user-layer.service';
import { MetadataService } from '../../../application/services/metadata.service';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AttributeListLayernameChooserComponent } from '../attribute-list-layername-chooser/attribute-list-layername-chooser.component';
import { UserLayerHelper } from '../../../analysis/helpers/user-layer.helper';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { selectFeatureTypeDataForTab, selectLoadingDataForTab, selectRelatedFeaturesForTab } from '../state/attribute-list.selectors';
import { AttributeListExportService, ExportType } from '../services/attribute-list-export.service';
import { PopoverService } from '../../../shared/popover/popover.service';
import { OverlayRef } from '../../../shared/overlay-service/overlay-ref';
import { AttributeListTreeDialogComponent } from '../attribute-list-tree-dialog/attribute-list-tree-dialog.component';
import { PopoverPositionEnum } from '../../../shared/popover/models/popover-position.enum';
import { AttributeListFeatureTypeData } from '../models/attribute-list-feature-type-data.model';
import { PageEvent } from '@angular/material/paginator';
import { clearAllFilters, clearFilterForFeatureType, updatePage } from '../state/attribute-list.actions';
import { Feature } from '../../../shared/generated';
import * as wellknown from 'wellknown';
import { LayerUtils } from '../../../shared/layer-utils/layer-utils.service';
import { setOpenFeatureForm } from '../../../feature-form/state/form.actions';

@Component({
  selector: 'tailormap-attribute-list-tab-toolbar',
  templateUrl: './attribute-list-tab-toolbar.component.html',
  styleUrls: ['./attribute-list-tab-toolbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributeListTabToolbarComponent implements OnInit, OnDestroy {

  @Input()
  public layerId: string;

  @Input()
  public featureType: number;

  @ViewChild('relationsButton', { static: true, read: ElementRef })
  private relationsButton: ElementRef<HTMLButtonElement>;

  public columns: AttributeListColumnModel[];
  public noRelations$: Observable<boolean>;

  private destroyed = new Subject();

  private exportParams: ExportFeaturesParameters = {
    application: 0,
    appLayer: 0,
    columns: [],
    type: '',
  };

  private popoverRef: OverlayRef;
  public featureTypeData: AttributeListFeatureTypeData;

  public creatingLayer: boolean;
  public createUserLayerName: string;
  public loadingData$: Observable<boolean>;

  constructor(
    private attributeListExportService: AttributeListExportService,
    private userLayer: UserLayerService,
    private tailorMapService: TailorMapService,
    public dialog: MatDialog,
    private metadataService: MetadataService,
    private store$: Store<AttributeListState>,
    private popoverService: PopoverService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  public ngOnInit(): void {
    this.store$.select(selectFeatureTypeDataForTab, this.layerId)
      .pipe(
        takeUntil(this.destroyed),
        filter(featureData => !!featureData),
      )
      .subscribe(featureData => {
        this.featureTypeData = featureData;
        this.changeDetectorRef.detectChanges();
      });

    this.loadingData$ = this.store$.select(selectLoadingDataForTab, this.layerId);

    this.exportParams.application = this.tailorMapService.getApplicationId();
    this.noRelations$ = this.store$.select(selectRelatedFeaturesForTab, this.layerId)
      .pipe(map(relations => relations.length === 0));
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
    if (this.popoverRef) {
      this.popoverRef.close();
    }
  }

  public onExportClick(format: ExportType): void {
    this.attributeListExportService.createAttributeListExport(format, this.layerId, this.featureType);
  }

  public canOpenPassportForm(): boolean {
    return this.getCheckedRowsAsFeatures().length > 0;
  }

  public canCreateUserLayer(): boolean {
    if (this.tailorMapService.getApplayerById(+(this.layerId)).userlayer) {
      return false;
    } else if (!this.tailorMapService.getFilterString(+(this.layerId), false)) {
      return false;
    } else {
      return true;
    }
  }

  public getToolTipMessage(): string {
    if (this.tailorMapService.getApplayerById(+(this.layerId)).userlayer) {
      return 'Er kunnen geen selectielagen op basis van andere selectielagen gemaakt worden';
    } else if(!this.tailorMapService.getFilterString(+(this.layerId), false)) {
      return 'Stel eerst een filter in op de attributenlijst in om een laag te kunnen publiceren';
    } else {
      return '';
    }
  }

  public createUserLayer(): void {
    const query = this.tailorMapService.getFilterString(+(this.layerId), false);
    const dialogRef = this.dialog.open(AttributeListLayernameChooserComponent, {
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
          this.creatingLayer = true;
          this.createUserLayerName = result;
          return this.userLayer.createUserLayerFromParams$({
            appLayerId: `${appLayerId}`,
            title: result,
            query,
            source: UserLayerHelper.createUserLayerSourceFromMetadata(attributeMetadata, appLayer),
          });
        }),
      )
      .subscribe(() => {
        this.creatingLayer = false;
        this.createUserLayerName = '';
      });
  }

  public onClearFeatureTypeFilterClick(): void {
    this.store$.dispatch(clearFilterForFeatureType({ layerId: this.layerId, featureType: this.featureType }));
  }

  public onClearAllFilterClick(): void {
    this.store$.dispatch(clearAllFilters({ layerId: this.layerId }));
  }

  public openAttributeTree(): void {
    if (this.popoverRef && this.popoverRef.isOpen) {
      this.popoverRef.close();
      return;
    }
    const WINDOW_WIDTH = 400;
    this.popoverRef = this.popoverService.open({
      origin: this.relationsButton.nativeElement,
      content: AttributeListTreeDialogComponent,
      data: { layerId: this.layerId },
      height: 250,
      width: Math.min(WINDOW_WIDTH, window.innerWidth),
      closeOnClickOutside: true,
      position: PopoverPositionEnum.BOTTOM_RIGHT_DOWN,
      positionOffset: 10,
    });
  }

  public onPageChange($event: PageEvent): void {
    this.store$.dispatch(updatePage({ layerId: this.layerId, featureType: this.featureTypeData.featureType, page: $event.pageIndex }));
  }

  public openPassportForm(): void {
    const features = this.getCheckedRowsAsFeatures();
    if (features.length === 0) {
      return;
    }
    this.store$.dispatch(setOpenFeatureForm({ features, closeAfterSave: true, editMode: true }));
  }

  /**
   * @TODO: check how to make this more generic and not tight to certain data types
   */
  private getCheckedRowsAsFeatures(): Feature[] {
    const feature = {} as Feature;
    const featuresChecked: Feature[] = [];
    this.featureTypeData.rows.forEach(row => {
      if (row._checked) {
        // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
        const { object_guid, related_featuretypes, __fid, _checked, _expanded, _selected, rowId, geometrie, ...rest } = row;
        if (row.geometrie) {
          rest.geometrie =  wellknown.parse(row.geometrie);
        }
        const appLayer = this.tailorMapService.getApplayerById(+(this.featureTypeData.layerId));
        const className = LayerUtils.sanitizeLayername(appLayer);
        feature.children = [];
        feature.clazz = className;
        feature.objectGuid = row.object_guid;
        feature.relatedFeatureTypes = row.related_featuretypes;
        feature.objecttype = className[0].toUpperCase() + className.substr(1);
        featuresChecked.push({ ...feature, ...rest });
      }
    });
    return featuresChecked;
  }

}
