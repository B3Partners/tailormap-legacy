
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Test } from './test';

@Injectable({
  providedIn: 'root',
})
export class PassportService {

  constructor() {
  }

  public getColumnNames$(layerName: string): Observable<string[]> {
    return of(Test.getPassport(layerName));
  }
}
