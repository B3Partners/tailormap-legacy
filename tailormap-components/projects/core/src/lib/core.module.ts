import { NgModule } from '@angular/core';
import { FeatureFormModule } from './feature-form/feature-form.module';
import { UserIntefaceModule } from './user-interface/user-interface.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AnalysisModule } from './analysis/analysis.module';
import { StoreModule } from '@ngrx/store';
import { reducers } from './state/root.reducer';
import { ApplicationModule } from './application/application.module';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot(reducers, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
      },
    }),
    WorkflowModule,
    FeatureFormModule,
    UserIntefaceModule,
    AnalysisModule,
    ApplicationModule,
  ],
  exports: [],
})
export class CoreModule {
}
