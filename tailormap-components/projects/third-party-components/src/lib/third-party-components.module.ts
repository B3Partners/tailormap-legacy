import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import {
  MaatregeltoetsModule,
  MaatregeltoetsMenuButtonComponent,
  MaatregeltoetsPopupComponent,
  MAATREGEL_LIJST_API_URL,
} from '@antea/components';
import { MaatregeltoetsWorkflowService } from './maatregeltoets-workflow.service';

@NgModule({
  declarations: [],
  providers: [
    { provide: MAATREGEL_LIJST_API_URL, useValue: 'http://localhost:3200/GBI_WEB_indicium/iam/ow_kennisbank/mt_maatregel' },
    MaatregeltoetsWorkflowService,
  ],
  imports: [
    CommonModule,
    MaatregeltoetsModule,
  ],
})
export class ThirdPartyComponentsModule {
  constructor(
    injector: Injector,
    maatregeltoetsWorkflowService: MaatregeltoetsWorkflowService,
  ) {
    customElements.define('antea-maatregeltoets-menu-button',
      createCustomElement(MaatregeltoetsMenuButtonComponent, {injector}));
    customElements.define('antea-maatregeltoets-popup',
      createCustomElement(MaatregeltoetsPopupComponent, {injector}));
  }
}
