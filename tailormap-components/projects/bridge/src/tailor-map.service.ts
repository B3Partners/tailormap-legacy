import { Injectable } from '@angular/core';
import { LayerVisibilityEvent } from '../../core/src/lib/shared/models/layer-visibility-models';
import { fromEvent, Observable, Subject } from 'rxjs';
import { AppLoader, MapComponent, ViewerController } from '../typings';
import { FormconfigRepositoryService } from '../../core/src/lib/shared/formconfig-repository/formconfig-repository.service';

@Injectable({
  providedIn: 'root',
})
export class TailorMapService {

  constructor() {
    this.init();
  }

  public layerVisibilityChanged$: Subject<LayerVisibilityEvent> = new Subject<LayerVisibilityEvent>();

  public getAppLoader(): AppLoader {
    return (window as any).FlamingoAppLoader as AppLoader;
  }

  public getContextPath(): string {
    return this.getAppLoader().get('contextPath') as string;
  }

  public getViewerController(): ViewerController {
    return this.getAppLoader().get('viewerController') as ViewerController;
  }

  public getMapComponent(): MapComponent {
    return this.getViewerController().mapComponent;
  }

  public init(): void {

    const vc = this.getViewerController();
    const mc = vc.mapComponent;
    const map = mc.getMap();
    map.addListener('ON_LAYER_VISIBILITY_CHANGED', (object, event) =>{
      this.layerVisibilityChanged$.next(event);
    });
  }
}
