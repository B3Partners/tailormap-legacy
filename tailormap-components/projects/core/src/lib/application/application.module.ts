import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { applicationStateKey } from './state/application.state';
import { applicationReducer } from './state/application.reducer';
import { ApplicationService } from './services/application.service';
import { ApplicationTreeNodeComponent } from './application-tree-node/application-tree-node.component';



@NgModule({
  declarations: [
    ApplicationTreeNodeComponent,
  ],
  exports: [
    ApplicationTreeNodeComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(applicationStateKey, applicationReducer),
  ],
})
export class ApplicationModule {
  constructor(_applicationService: ApplicationService) {}
}
