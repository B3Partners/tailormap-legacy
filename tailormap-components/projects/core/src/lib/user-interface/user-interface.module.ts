import {NgModule} from '@angular/core';

import {AddFeatureComponent} from "./add-feature/add-feature.component";
import {MatIconModule} from "@angular/material/icon";
import {SharedModule} from "../shared/shared.module";
import {CommonModule} from "@angular/common";
import { TestAttributeserviceComponent } from './test-attributeservice/test-attributeservice.component';

@NgModule({
  declarations: [
    AddFeatureComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule
  ],
  exports: [
    AddFeatureComponent,
    MatIconModuleTileServiceTest
  ],
  entryComponents: []
})
export class UserIntefaceModule {
}

