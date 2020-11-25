import { Injectable } from '@angular/core';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import {
  VectorLayer,
  Extent,
} from '../../../../../bridge/typings';
import {
  HighlightParams,
  HighlightResponse,
} from './highlight-models';
import { HttpClient, HttpParams, } from '@angular/common/http';
import { FeatureExtentService } from '../feature-extent-service/feature-extent.service';

@Injectable({
  providedIn: 'root'
})
export class HighlightService {

  private actionUrl = '/viewer/action/simplify';

  private vectorLayer: VectorLayer;

  constructor(private tailorMap: TailorMapService,
              private featureExtentService: FeatureExtentService,
              private http: HttpClient) {
  }

  private createVectorLayer(): void {
    const vc = this.tailorMap.getViewerController();
    const mapComponent = this.tailorMap.getMapComponent();
    this.vectorLayer = mapComponent.createVectorLayer({
      name: 'HighlightVectorLayer',
      geometrytypes: ['Circle', 'Polygon', 'MultiPolygon', 'Point', 'LineString'],
      mustCreateVertices: false,
      allowselection: false,
      showmeasures: false,
      editable: false,
      viewerController: vc,
      style: {
        fillcolor: 'FF0000',
        fillopacity: 50,
        strokecolor: '0000FF',
        strokewidth: 4,
        strokeopacity: 100
      }
    });
    vc.registerSnappingLayer(this.vectorLayer)
    mapComponent.getMap().addLayer(this.vectorLayer);
  }

  public clearHighlight(): void {
    if (this.vectorLayer) {
      this.vectorLayer.removeAllFeatures();
    }
  }

  public highlightFeature(featureFId: string, appLayerId: number,
                          zoomTo: boolean = false, zoomToBuffer: number = 0): void {
    // console.log('#HighlightService - highlightFeature');
    // console.log(featureFId + ' ' + appLayerId);

    // Create vectorlayer?
    if (!this.vectorLayer) {
      this.createVectorLayer();
    }

    // Clear highlight.
    this.clearHighlight();

    const vc = this.tailorMap.getViewerController();

    const hightlightParams: HighlightParams = {
      application: vc.app.id,
      featureId: featureFId,
    }
    if (appLayerId) {
      hightlightParams.appLayer = appLayerId.toString(10);
    }
    let httpParams: HttpParams = new HttpParams();
    Object.entries(hightlightParams).forEach(([key, value]) => {
      httpParams = httpParams.set(key, String(value));
    });
    this.http.get(this.actionUrl,{params: httpParams})
      .subscribe( (data: HighlightResponse) => {
        if (data.success) {
          this.vectorLayer.addFeatureFromWKT(data.geom);
          if (zoomTo) {
            this.zoomToFeature(featureFId, appLayerId, zoomToBuffer);
          }
        }
      }
    );
  }

  public zoomToFeature(featureFId: string, appLayerId: number,
                       zoomToBuffer: number): void {
    // Get extent.
    this.featureExtentService.getExtentForFeatures$(featureFId,
                                                    appLayerId,
                                                    zoomToBuffer)
      .subscribe((extent: Extent) => {
        if (extent) {
          const map = this.tailorMap.getMapComponent().getMap();
          map.zoomToExtent(extent);
        }
      })
  }

}
