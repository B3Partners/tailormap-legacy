import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  OVERLAY_DATA,
  OverlayService,
} from '../../shared/overlay-service/overlay.service';
import { TreeModel } from '../../shared/tree/models/tree.model';
import { TreeService } from '../../shared/tree/tree.service';
import { of } from 'rxjs';

export interface LayerSelectionData {
  tree: TreeModel[];
}

export interface LayerSelectionResult {
  selectedLayer: string;
}

@Component({
  selector: 'tailormap-create-layer-layer-selection',
  templateUrl: './create-layer-layer-selection.component.html',
  styleUrls: ['./create-layer-layer-selection.component.css'],
  providers: [
    TreeService,
  ],
})
export class CreateLayerLayerSelectionComponent implements OnInit {

  constructor(
    @Inject(OVERLAY_DATA) private data: LayerSelectionData,
    private treeService: TreeService,
  ) {
    this.treeService.setDataSource(of(data.tree));
  }

  public static open(overlay: OverlayService, data: LayerSelectionData) {
    return overlay.open<LayerSelectionResult, LayerSelectionData>(
      CreateLayerLayerSelectionComponent,
      data,
    );
  }

  public ngOnInit(): void {
  }

}
