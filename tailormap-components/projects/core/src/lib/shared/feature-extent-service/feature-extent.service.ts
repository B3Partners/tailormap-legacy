import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Extent,
} from '../../../../../bridge/typings';
import {
  FeatureExtentParams,
  FeatureExtentResponse,
} from './feature-extent-models';
import { TailorMapService } from '../../../../../bridge/src/tailor-map.service';

@Injectable({
  providedIn: 'root',
})
export class FeatureExtentService {

  private actionUrl = '';

  constructor(private http: HttpClient,
              private tailorMap: TailorMapService) {
    // Set action url.
    this.actionUrl = this.tailorMap.getContextPath() + '/action/extent';
  }

  private doRequest$(filter: string,
                     appLayerId: number,
                     buffer: number): Observable<Extent> {

    const featureExtentParams: FeatureExtentParams = {
      buffer,
      filter,
      appLayer: appLayerId.toString(10),
    }
    let httpParams: HttpParams = new HttpParams();
    Object.entries(featureExtentParams).forEach(([key, value]) => {
      httpParams = httpParams.set(key, String(value));
    });

    return this.http.get<FeatureExtentResponse>(this.actionUrl, {params: httpParams})
      .pipe(
          // tap((data: FeatureExtentResponse) => {
          //   console.log(data);
          // }),
          map((data: FeatureExtentResponse) => {
            if (data.success) {
              return data.extent;
            } else {
              return null;
            }
          }),
      );
  }

  public getExtentForFeatures$(featureFIds: string | string[],
                               appLayerId: number,
                               buffer: number): Observable<Extent> {
    let fids: string;
    if (Array.isArray(featureFIds)) {
      // tslint:disable-next-line: quotemark
      fids = featureFIds.join("','");
    } else {
      fids = featureFIds;
    }
    // tslint:disable-next-line: quotemark
    const filter = ["IN ('", fids, "')"].join("");
    return this.doRequest$(filter, appLayerId, buffer);
  }

  // TODO: NOT TESTED!!
  public getExtentForFilter$(filter: string, appLayerId: number,
                             buffer: number): Observable<Extent> {
    if (filter === '') {
      filter = 'include';
    }
    return this.doRequest$(filter, appLayerId,  buffer);
  }

}
