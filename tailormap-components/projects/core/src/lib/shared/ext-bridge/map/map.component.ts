import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MapService, MoveMap} from "./map.service";
import {DialogClosedData} from "../../../feature-form/form-popup/form-popup-models";

@Component({
  selector: 'flamingo-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor(private mapService: MapService) { }

  @Output()
  public moveMap = new EventEmitter<MoveMap>();

  @Input()
  public set layerVisibilityChanged (value :string){
    this.mapService.layerVisibilityChanged(value);
  }

  ngOnInit(): void {
    this.mapService.moveMapObservable$.subscribe(value => {
      this.moveMap.emit(value);
    });
  }
}
