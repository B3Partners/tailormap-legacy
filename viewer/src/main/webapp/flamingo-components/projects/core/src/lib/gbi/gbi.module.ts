import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WegvakkenFormComponent } from './wegvakken-form/wegvakken-form.component';
import { SharedModule } from '../shared/shared.module';
import { WegvakPopupComponent } from './wegvak-popup/wegvak-popup.component';
import { WegvakkenTreeComponent } from './wegvakken-tree/wegvakken-tree.component';
import { WegvakFormfieldComponent } from './wegvak-formfield/wegvak-formfield.component';



@NgModule({
  declarations: [WegvakkenFormComponent, WegvakPopupComponent, WegvakkenTreeComponent, WegvakFormfieldComponent],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    WegvakPopupComponent,
  ],
  entryComponents: [
    WegvakkenFormComponent,
  ],
})
export class GbiModule { }
