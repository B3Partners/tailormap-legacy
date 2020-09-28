/* tslint:disable */
import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration, ApiConfigurationParams } from './api-configuration';

import { AttributeControllerService } from './services/attribute-controller.service';
import { FeatureControllerService } from './services/feature-controller.service';
import { RoadInspectionControllerService } from './services/road-inspection-controller.service';
import { RoadsectionPartControllerService } from './services/roadsection-part-controller.service';
import { RoadsectionPartPlanningControllerService } from './services/roadsection-part-planning-controller.service';
import { TreeControllerService } from './services/tree-controller.service';
import { TreeInspectionControllerService } from './services/tree-inspection-controller.service';
import { WellControllerService } from './services/well-controller.service';

/**
 * Module that provides all services and configuration.
 */
@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: [
    AttributeControllerService,
    FeatureControllerService,
    RoadInspectionControllerService,
    RoadsectionPartControllerService,
    RoadsectionPartPlanningControllerService,
    TreeControllerService,
    TreeInspectionControllerService,
    WellControllerService,
    ApiConfiguration
  ],
})
export class ApiModule {
  static forRoot(params: ApiConfigurationParams): ModuleWithProviders<ApiModule> {
    return {
      ngModule: ApiModule,
      providers: [
        {
          provide: ApiConfiguration,
          useValue: params
        }
      ]
    }
  }

  constructor( 
    @Optional() @SkipSelf() parentModule: ApiModule,
    @Optional() http: HttpClient
  ) {
    if (parentModule) {
      throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
      'See also https://github.com/angular/angular/issues/20575');
    }
  }
}
