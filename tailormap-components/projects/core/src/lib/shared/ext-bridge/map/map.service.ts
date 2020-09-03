import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {LayerVisibilityEvent} from "../../layer-visibility-service/layer-visibility-models";

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor() { }

  // Observable string sources
  private layerVisibilitySubject = new Subject<LayerVisibilityEvent>();
  layerVisibilityChanged$ = this.layerVisibilitySubject.asObservable();

  // Observable string sources
  private moveMapSubject = new Subject<MoveMap>();
  moveMapObservable$ = this.moveMapSubject.asObservable();

  public moveMap(minx: number,miny: number,maxx: number,maxy: number){
    this.moveMapSubject.next({minx,  miny, maxx, maxy});
  }

  public layerVisibilityChanged(val: string){
    let realValue = JSON.parse(val);
    this.layerVisibilitySubject.next(realValue);
  }
}

export interface MoveMap{
  minx: number;
  miny: number;
  maxx: number;
  maxy: number;
}

