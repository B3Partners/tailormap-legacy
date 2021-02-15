import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowControllerComponent } from './workflow-controller/workflow-controller.component';
import { UserIntefaceModule } from '../user-interface/user-interface.module';
import { FeatureFormModule } from '../feature-form/feature-form.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { workflowStateKey } from './state/workflow.state';
import { workflowReducer } from './state/workflow.reducer';
import { WorkflowEffects } from './state/workflow.effects';


@NgModule({
  declarations: [WorkflowControllerComponent],
  imports: [
    UserIntefaceModule,
    CommonModule,
    FeatureFormModule,
    StoreModule.forFeature(workflowStateKey, workflowReducer),
    EffectsModule.forFeature([WorkflowEffects]),
  ],
})
export class WorkflowModule {
}
