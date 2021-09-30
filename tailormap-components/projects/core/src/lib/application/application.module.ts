import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '../shared/shared.module';
import { applicationStateKey } from './state/application.state';
import { applicationReducer } from './state/application.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ApplicationEffects } from './state/application.effects';


@NgModule({
  declarations: [],
  exports: [],
  imports: [
    CommonModule,
    SharedModule,
    StoreModule.forFeature(applicationStateKey, applicationReducer),
    EffectsModule.forFeature([ ApplicationEffects ]),
  ],
})
export class ApplicationModule {}
