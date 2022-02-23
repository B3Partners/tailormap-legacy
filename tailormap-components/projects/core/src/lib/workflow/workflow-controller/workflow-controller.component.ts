import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { WorkflowControllerService } from './workflow-controller.service';
import { WorkflowFactoryService } from '../workflow-factory/workflow-factory.service';
import { VectorLayer } from '../../../../../bridge/typings';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { MapClickedEvent } from '../../shared/models/event-models';
import { Store } from '@ngrx/store';
import { WorkflowState } from '../state/workflow.state';
import { updateConfig } from '../state/workflow.actions';
import { selectCopyFormOpen, selectFeatureFormEnabled, selectRelationsFormOpen } from '../../feature-form/state/form.selectors';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'tailormap-workflow-controller',
  templateUrl: './workflow-controller.component.html',
  styleUrls: ['./workflow-controller.component.css'],
})
export class WorkflowControllerComponent implements OnInit {

  private vectorlayerId: string;
  public formComponentOpen$: Observable<boolean>;
  public formCopyComponentOpen$: Observable<boolean>;
  public formRelationsComponentOpen$: Observable<boolean>;

  constructor(
    private controller: WorkflowControllerService,
    private factory: WorkflowFactoryService,
    private tailorMap: TailorMapService,
    private store$: Store<WorkflowState>,
  ) {
    this.formCopyComponentOpen$ = this.store$.select(selectCopyFormOpen);
    this.formRelationsComponentOpen$ = this.store$.select(selectRelationsFormOpen);
    this.formComponentOpen$ = combineLatest([
      this.store$.select(selectFeatureFormEnabled),
      this.formCopyComponentOpen$,
      this.formRelationsComponentOpen$,
    ]).pipe(map(([ formOpen, copyFormOpen, relationsFormOpen ]) => {
      return formOpen && !copyFormOpen && !relationsFormOpen;
    }));
  }

  @Input()
  public set vectorLayerId(id: string) {
    this.vectorlayerId = id;
  }

  @Input()
  public set highlightLayerId(id: string) {
    const vc = this.tailorMap.getViewerController();
    const mc = vc.mapComponent;
    const olMap = mc.getMap();
    const highlightlayer = olMap.getLayer(id) as VectorLayer;
    const vectorlayer = olMap.getLayer(this.vectorlayerId) as VectorLayer;
    this.factory.vectorLayer = vectorlayer;
    this.factory.highlightLayer = highlightlayer;

    vectorlayer.addListener('ON_FEATURE_ADDED', (vectorLayer: VectorLayer, feature: any) => {
      this.controller.geometryDrawn(vectorLayer, feature);
    });
    this.controller.init();
  }

  @Input()
  public set useSelectedLayerFilter(useSelectedLayerFilter: string) {
    this.store$.dispatch(updateConfig({ config: { useSelectedLayerFilter: useSelectedLayerFilter !== 'false' }}));
  }

  @Input()
  public set mapClicked(data: string) {
    const mapClickData = JSON.parse(data) as MapClickedEvent;
    this.controller.mapClicked(mapClickData);
  }

  public ngOnInit(): void {
  }

}
