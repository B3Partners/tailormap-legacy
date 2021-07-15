import { NgModule } from '@angular/core';
import { FeatureFormModule } from './feature-form/feature-form.module';
import { UserIntefaceModule } from './user-interface/user-interface.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AnalysisModule } from './analysis/analysis.module';
import { StoreModule } from '@ngrx/store';
import { reducers } from './state/root.reducer';
import { ApplicationModule } from './application/application.module';
import { EffectsModule } from '@ngrx/effects';
import { APPLICATION_SERVICE, ATTRIBUTE_SERVICE, EXPORT_SERVICE, HIGHLIGHT_SERVICE, METADATA_SERVICE, STATISTIC_SERVICE } from '@tailormap/models';
import { ExportService } from './shared/export-service/export.service';
import { MetadataService } from './application/services/metadata.service';
import { HighlightService } from './shared/highlight-service/highlight.service';
import { StatisticService } from './shared/statistic-service/statistic.service';
import { AttributeService } from './shared/attribute-service/attribute.service';
import { ApplicationService } from './application/services/application.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { IconService, ICON_SERVICE_ICON_LOCATION } from '@tailormap/shared';
import { environment } from '../../../bridge/src/environments/environment';
import { registerLocaleData } from '@angular/common';
import localenl from '@angular/common/locales/nl';

registerLocaleData(localenl, 'nl');

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forRoot(reducers, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
      },
    }),
    EffectsModule.forRoot([]),
    AnalysisModule,
    WorkflowModule,
    FeatureFormModule,
    UserIntefaceModule,
    ApplicationModule,
  ],
  exports: [],
  providers: [
    { provide: ICON_SERVICE_ICON_LOCATION, useValue: `${environment.basePath}/assets/core/imgs/` || '' },
    { provide: APPLICATION_SERVICE, useClass: ApplicationService },
    { provide: ATTRIBUTE_SERVICE, useClass: AttributeService },
    { provide: HIGHLIGHT_SERVICE, useClass: HighlightService },
    { provide: STATISTIC_SERVICE, useClass: StatisticService },
    { provide: METADATA_SERVICE, useClass: MetadataService },
    { provide: EXPORT_SERVICE, useClass: ExportService },
  ],
})
export class CoreModule {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private iconService: IconService,
  ) {
    this.iconService.loadIconsToIconRegistry(this.matIconRegistry, this.domSanitizer);
  }
}
