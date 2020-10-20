import { NgModule } from '@angular/core';
import { FeatureFormModule } from './feature-form/feature-form.module';
import { UserIntefaceModule } from './user-interface/user-interface.module';
import { WorkflowModule } from './workflow/workflow.module';

@NgModule({
  declarations: [],
  imports: [
    WorkflowModule,
    FeatureFormModule,
    UserIntefaceModule,
  ],
  exports: [],
})
export class CoreModule {
}
