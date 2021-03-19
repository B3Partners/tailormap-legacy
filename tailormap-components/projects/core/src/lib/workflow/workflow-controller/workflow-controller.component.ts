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

@Component({
  selector: 'tailormap-workflow-controller',
  templateUrl: './workflow-controller.component.html',
  styleUrls: ['./workflow-controller.component.css'],
})
export class WorkflowControllerComponent implements OnInit {

  private vectorlayerId: string;

  constructor(
    private controller: WorkflowControllerService,
    private factory: WorkflowFactoryService,
    private tailorMap: TailorMapService,
    private store$: Store<WorkflowState>,
  ) {}

  @Input()
  public set vectorLayerId(id: string) {
    this.vectorlayerId = id;
  }

  @Input()
  public set highlightLayerId(id: string) {
    const vc = this.tailorMap.getViewerController();
    const mc = vc.mapComponent;
    const map = mc.getMap();
    const highlightlayer = map.getLayer(id) as VectorLayer;
    const vectorlayer = map.getLayer(this.vectorlayerId) as VectorLayer;
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
