import { Component } from '@angular/core';
import { OverlayService } from '../../../shared/overlay-service/overlay.service';
import { OverlayRef } from '../../../shared/overlay-service/overlay-ref';

@Component({
  selector: 'tailormap-simple-criteria',
  templateUrl: './simple-criteria.component.html',
  styleUrls: ['./simple-criteria.component.css', '../../../application/style/application-tree.css'],
})
export class SimpleCriteriaComponent {

  constructor(
    private overlayRef: OverlayRef,
  ) { }

  public static open(overlay: OverlayService) {
    return overlay.open(
      SimpleCriteriaComponent,
      {},
    );
  }

  public closePanel() {
    this.overlayRef.close({ selectedLayer: undefined });
  }

}
