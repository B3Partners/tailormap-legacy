import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowControllerComponent } from './workflow-controller/workflow-controller.component';
import { UserIntefaceModule } from '../user-interface/user-interface.module';


@NgModule({
  declarations: [WorkflowControllerComponent],
  imports: [
    UserIntefaceModule,
    CommonModule,
  ],
})
export class WorkflowModule {
}
