import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from './form/form.component';
import { SharedModule } from '../shared/shared.module';
import { FormfieldComponent } from './form-field/formfield.component';
import { FormCreatorComponent } from './form-creator/form-creator.component';
import { ApiModule } from '../shared/generated';
import { FormTreeComponent } from './form-tree/form-tree.component';
import { UserIntefaceModule } from '../user-interface/user-interface.module';
import { FormCopyComponent } from './form-copy/form-copy.component';
import { StoreModule } from '@ngrx/store';
import { formStateKey } from './state/form.state';
import { formReducer } from './state/form.reducer';
import { EffectsModule } from '@ngrx/effects';
import { FormEffects } from './state/form.effects';

@NgModule({
  declarations: [
    FormComponent,
    FormTreeComponent,
    FormfieldComponent,
    FormCreatorComponent,
    FormCopyComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ApiModule,
    UserIntefaceModule,
    StoreModule.forFeature(formStateKey, formReducer),
    EffectsModule.forFeature([ FormEffects ]),
  ],
  exports: [
    FormComponent,
  ],
  entryComponents: [
  ],
})
export class FeatureFormModule {
}

