import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Feature } from '../generated';

@Injectable({
  providedIn: 'root'
})
export class GbiControllerService {

  constructor() { }

  public copyModeChange$: Subject<Feature> = new Subject<Feature>();
}
