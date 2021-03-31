import {
  Injectable,
  NgZone,
} from '@angular/core';
import {
  fromEvent,
  Observable,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {
  ExtentChangedEvent,
  LayerVisibilityEvent,
} from '../../core/src/lib/shared/models/event-models';
import {
  App,
  AppLayer,
  AppLoader,
  MapComponent,
  ViewerController,
} from '../typings';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TailorMapService {

  constructor(private ngZone: NgZone) {
    this.init();
  }

  private applicationConfigSubject$: ReplaySubject<App> = new ReplaySubject<App>(1);
  public applicationConfig$: Observable<App> = this.applicationConfigSubject$.asObservable();

  private layersInitializedSubject$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  public layersInitialized$ = this.layersInitializedSubject$.asObservable();

  private layerVisibilityChangedSubject$: Subject<LayerVisibilityEvent> = new Subject<LayerVisibilityEvent>();
  public layerVisibilityChanged$ = this.layerVisibilityChangedSubject$.asObservable();

  private extentChangedSubject$: Subject<ExtentChangedEvent> = new Subject<ExtentChangedEvent>();
  public extentChanged$ = this.extentChangedSubject$.asObservable();

  private selectedLayerSubject$: Subject<AppLayer> = new Subject<AppLayer>();
  public selectedLayerChanged$ = this.selectedLayerSubject$.asObservable();
  public selectedLayer: AppLayer;

  public getAppLoader(): AppLoader {
    return (window as any).FlamingoAppLoader as AppLoader;
  }

  public getContextPath(): string {
    return this.getAppLoader().get('contextPath') as string;
  }

  public getApplicationId(): number {
    return +(this.getAppLoader().get('appId'));
  }

  public getViewerController(): ViewerController {
    return this.getAppLoader().get('viewerController') as ViewerController;
  }

  public getMapComponent(): MapComponent {
    return this.getViewerController().mapComponent;
  }

  public init(): void {
    if (this.getViewerController() !== null) {
      this.initViewerController();
      return;
    }
    fromEvent(window, 'viewerControllerReady')
      .pipe(take(1))
      .subscribe(() => {
        this.initViewerController();
      });
  }

  private initViewerController() {
    const vc = this.getViewerController();
    const mc = vc.mapComponent;
    const map = mc.getMap();
    vc.addListener('ON_LAYERS_INITIALIZED', () => {
      this.ngZone.run(() => this.layersInitializedSubject$.next(true));
    });
    map.addListener('ON_LAYER_VISIBILITY_CHANGED', (object, event) => {
      this.ngZone.run(() => this.layerVisibilityChangedSubject$.next(event as LayerVisibilityEvent));
    });
    map.addListener('ON_FINISHED_CHANGE_EXTENT', (object, event) => {
      this.ngZone.run(() => this.extentChangedSubject$.next(event as ExtentChangedEvent));
    });
    vc.addListener('ON_LAYER_SELECTED', (event) => {
      const appLayer = (!event || !event.appLayer) ? null : event.appLayer;
      this.selectedLayer = appLayer;
      this.ngZone.run(() => this.selectedLayerSubject$.next(appLayer));
    });
    this.applicationConfigSubject$.next(this.getAppLoader().getApplicationConfig());
  }

  public getApplayerById(id: number): AppLayer {
    return this.getViewerController().getAppLayerById(id);
  }
}
