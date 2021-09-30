import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiModule } from './generated';
import { DialogCloseButtonComponent } from './dialog-close-button/dialog-close-button.component';
import { OverlayComponent } from './overlay-service/overlay/overlay.component';
import { CapitalizeFirstPipe } from './pipes/capitalizeFirst.pipe';
import { ColorPickerComponent } from './color-picker/color-picker.component';
import { IconPickerComponent } from './icon-picker/icon-picker.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { FeatureSelectionComponent } from './feature-selection/feature-selection.component';
import { SharedModule as TailormapSharedModule } from '@tailormap/shared';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    DialogCloseButtonComponent,
    OverlayComponent,
    ColorPickerComponent,
    IconPickerComponent,
    CapitalizeFirstPipe,
    ErrorMessageComponent,
    FeatureSelectionComponent,
  ],
  imports: [
    ApiModule.forRoot({
      rootUrl: window.location.origin + '/viewer/action/proxyrest?url=',
    }),
    CommonModule,
    HttpClientModule,
    TailormapSharedModule,
  ],
  exports: [
    HttpClientModule,
    TailormapSharedModule,
    DialogCloseButtonComponent,
    ColorPickerComponent,
    IconPickerComponent,
    CapitalizeFirstPipe,
    ErrorMessageComponent,
  ],
})
export class SharedModule {}
