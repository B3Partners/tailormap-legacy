import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  OVERLAY_DATA,
  OverlayService,
} from '../../shared/overlay-service/overlay.service';
import { TreeModel } from '../../shared/tree/models/tree.model';
import { TreeService } from '../../shared/tree/tree.service';
import { TransientTreeHelper } from '../../shared/tree/helpers/transient-tree.helper';
import {
  AppLayer,
  Level,
} from '../../../../../bridge/typings';
import { OverlayRef } from '../../shared/overlay-service/overlay-ref';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApplicationTreeHelper } from '../../application/helpers/application-tree.helper';
import { CriteriaSourceModel } from '../models/criteria-source.model';

export interface LayerSelectionData {
  tree: TreeModel[];
  title: string;
  selectedLayer?: CriteriaSourceModel;
}

export interface LayerSelectionResult {
  selectedLayer: AppLayer;
}

@Component({
  selector: 'tailormap-create-layer-layer-selection',
  templateUrl: './create-layer-layer-selection.component.html',
  styleUrls: ['./create-layer-layer-selection.component.css', '../../application/style/application-tree.css'],
  providers: [
    TreeService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLayerLayerSelectionComponent implements OnInit, OnDestroy {

  private destroyed = new Subject();
  private transientTreeHelper: TransientTreeHelper<AppLayer | Level>;

  constructor(
    @Inject(OVERLAY_DATA) public data: LayerSelectionData,
    private overlayRef: OverlayRef<LayerSelectionResult>,
    private treeService: TreeService,
  ) {}

  public static open(overlay: OverlayService, data: LayerSelectionData) {
    return overlay.open<LayerSelectionResult, LayerSelectionData>(
      CreateLayerLayerSelectionComponent,
      data,
    );
  }

  public ngOnInit(): void {
    this.transientTreeHelper = new TransientTreeHelper(
      this.treeService,
      this.data.tree,
      node => {
        return this.data.selectedLayer
          && ApplicationTreeHelper.isAppLayer(node.metadata)
          && node.metadata.id === `${this.data.selectedLayer.layerId}`;
      },
    );
    this.treeService.checkStateChangedSource$
      .pipe(takeUntil(this.destroyed))
      .subscribe(changed => {
        let checkedLayer;
        changed.forEach((checked, layer) => {
          if (checked && !checkedLayer) {
            checkedLayer = layer;
          }
        })
        this.overlayRef.close({
          selectedLayer: typeof checkedLayer !== 'undefined' ? this.treeService.getNode(checkedLayer).metadata : undefined,
        });
      });
  }

  public ngOnDestroy() {
    this.transientTreeHelper.destroy();
    this.destroyed.next();
    this.destroyed.complete();
  }

  public closePanel() {
    this.overlayRef.close({ selectedLayer: undefined });
  }

}
