import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { applicationStateKey } from './state/application.state';
import { applicationReducer } from './state/application.reducer';
import { ApplicationService } from './application.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(applicationStateKey, applicationReducer),
  ],
})
export class ApplicationModule {
  constructor(_applicationService: ApplicationService) {}
}
