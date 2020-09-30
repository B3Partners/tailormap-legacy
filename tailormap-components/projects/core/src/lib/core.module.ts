import { NgModule } from '@angular/core';
import { FeatureFormModule } from './feature-form/feature-form.module';
import { UserIntefaceModule } from './user-interface/user-interface.module';

@NgModule({
  declarations: [],
  imports: [
    FeatureFormModule,
    UserIntefaceModule,
  ],
  exports: [],
})
export class CoreModule {
}
