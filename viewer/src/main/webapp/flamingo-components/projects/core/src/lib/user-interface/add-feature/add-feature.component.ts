import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DialogClosedData} from "../../feature-form/form-popup/form-popup-models";
import {AddButtonEvent} from "./add-feature-models";

@Component({
  selector: 'flamingo-add-feature',
  templateUrl: './add-feature.component.html',
  styleUrls: ['./add-feature.component.css']
})
export class AddFeatureComponent implements OnInit {

  @Output()
  public addFeature = new EventEmitter<AddButtonEvent>();

  public visibleFeatureTypes:string[];
  constructor() {
    this.visibleFeatureTypes = [
      'pietje','jantje','klaasje'
    ];
  }

  ngOnInit() {
  }

  public click(){
    this.addFeature.emit({
      featuretype: 'wegvakonderdeel'
    });
  }
}
