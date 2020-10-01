/* tslint:disable */
import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration, ApiConfigurationParams } from './api-configuration';

import { AttributeControllerService } from './services/attribute-controller.service';
import { FeatureControllerService } from './services/feature-controller.service';
import { FormCultPlantingControllerService } from './services/form-cult-planting-controller.service';
import { FormGrassControllerService } from './services/form-grass-controller.service';
import { FormHedgeControllerService } from './services/form-hedge-controller.service';
import { FormNatPlantingControllerService } from './services/form-nat-planting-controller.service';
import { FormRoadInspectionControllerService } from './services/form-road-inspection-controller.service';
import { FormRoadsectionPartControllerService } from './services/form-roadsection-part-controller.service';
import { FormRoadsectionPartPlanningControllerService } from './services/form-roadsection-part-planning-controller.service';
import { FormTreeControllerService } from './services/form-tree-controller.service';
import { FormTreeInspectionControllerService } from './services/form-tree-inspection-controller.service';
import { FormWellControllerService } from './services/form-well-controller.service';

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
    FormCultPlantingControllerService,
    FormGrassControllerService,
    FormHedgeControllerService,
    FormNatPlantingControllerService,
    FormRoadInspectionControllerService,
    FormRoadsectionPartControllerService,
    FormRoadsectionPartPlanningControllerService,
    FormTreeControllerService,
    FormTreeInspectionControllerService,
    FormWellControllerService,
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
