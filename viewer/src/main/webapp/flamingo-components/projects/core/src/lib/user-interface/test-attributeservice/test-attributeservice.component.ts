import { Component, OnInit } from '@angular/core';
import {FormconfigRepositoryService} from "../../shared/formconfig-repository/formconfig-repository.service";
import {AttributeService} from "../../shared/attribute-service/attribute.service";
import {AttributeListParameters, RelationType} from "./models";

@Component({
  selector: 'flamingo-test-attributeservice',
  templateUrl: './test-attributeservice.component.html',
  styleUrls: ['./test-attributeservice.component.css']
})
export class TestAttributeserviceComponent implements OnInit {

  constructor(
    private service: AttributeService
  ) { }

  ngOnInit() {
  }

  click() {
    let params: AttributeListParameters = {
      appLayer: 16,
      application: 3,
      featureType: 169,
      limit: 4
    };
    this.service.featureTypeMetadata(params)
      .subscribe(value => {
        console.log('testrelate', value.relations[0].type == RelationType.RELATE);
        console.log('testjoin', value.relations[0].type == RelationType.JOIN);
      });
  }
}
