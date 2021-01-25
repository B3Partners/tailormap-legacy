import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowControllerComponent } from './workflow-controller/workflow-controller.component';
import { UserIntefaceModule } from '../user-interface/user-interface.module';
import {FeatureFormModule} from "../feature-form/feature-form.module";


@NgModule({
  declarations: [WorkflowControllerComponent],
    imports: [
        UserIntefaceModule,
        CommonModule,
        FeatureFormModule,
    ],
})
export class WorkflowModule {
}
