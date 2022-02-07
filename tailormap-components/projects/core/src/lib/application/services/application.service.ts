import { Injectable, OnDestroy } from '@angular/core';
import { TailorMapFilters, TailorMapService } from '../../../../../bridge/src/tailor-map.service';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../state/application.state';
import { setApplicationContent, setFormConfigs, setLayerVisibility, setSelectedAppLayer } from '../state/application.actions';
import { concatMap, debounceTime, map, take, takeUntil, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { FormConfigRepositoryService } from '../../shared/formconfig-repository/form-config-repository.service';
import { DomainRepositoryService } from '../../feature-form/linked-fields/domain-repository/domain-repository.service';
import {
  AppLayerModel, ApplicationServiceModel, ExtendedFormConfigurationModel, FormConfiguration, FormConfigurationFormFieldType,
} from '@tailormap/api';
import {
  selectApplicationTree, selectApplicationTreeWithoutBackgroundLayers, selectFormConfigForFeatureTypeName, selectFormConfigs,
  selectFormConfigsLoaded, selectSelectedAppLayer, selectVisibleLayersWithAttributes,
} from '../state/application.selectors';
import { ExtendedFormConfigurationModel as LocalExtendedFormConfigurationModel } from '../models/extended-form-configuration.model';
import { FormFieldType } from '../../feature-form/form/form-models';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService implements OnDestroy, ApplicationServiceModel {

  private destroyed = new Subject();

  private applicationId: number;
  private visibilityChangedMap: Map<string, boolean> = new Map();

  private editFeatureCompleteSubject$ = new Subject<{ layerId: string }>();
  private layerFilterChangedSubject$ = new Subject<{ appLayer: AppLayerModel; filter?: string | null }>();

  constructor(
    private tailormapService: TailorMapService,
    private store$: Store<ApplicationState>,
    private formConfigRepositoryService: FormConfigRepositoryService,
    private domainRepositoryService: DomainRepositoryService,
  ) {
    this.tailormapService.applicationConfig$
      .pipe(
        take(1),
      )
      .subscribe(app => {
        this.store$.dispatch(setApplicationContent({
          id: app.id,
          root: app.selectedContent,
          levels: Object.values(app.levels),
          layers: Object.values(app.appLayers),
        }));
        this.applicationId = app.id;

        this.updateLayerVisibility();
      });

    this.tailormapService.layerVisibilityChanged$
      .pipe(
        takeUntil(this.destroyed),
        tap(event => {
          this.visibilityChangedMap.set(`${event.layer.id}`, event.visible);
        }),
        debounceTime(100),
      )
      .subscribe(() => {
        this.store$.dispatch(setLayerVisibility({visibility: this.visibilityChangedMap}));
        this.visibilityChangedMap = new Map();
      });

    this.tailormapService.selectedLayerChanged$
      .pipe(takeUntil(this.destroyed))
      .subscribe(selectedAppLayer => {
        this.store$.dispatch(setSelectedAppLayer({layerId: !!selectedAppLayer ? `${selectedAppLayer.id}` : null}));
      });

    this.tailormapService.layerFilterChangedChanged$
      .pipe(takeUntil(this.destroyed))
      .subscribe(({ appLayer, filter }) => {
        this.layerFilterChangedSubject$.next({
          appLayer: {
            ...appLayer,
            serviceId: '1', // @TODO: Temporary fix
          },
          filter,
        });
      });

    this.formConfigRepositoryService.loadFormConfiguration$()
      .pipe(
        takeUntil(this.destroyed),
        concatMap(formConfigs => this.domainRepositoryService.initFormConfig$(formConfigs)),
      )
      .subscribe(formConfigs => {
        this.store$.dispatch(setFormConfigs({formConfigs}));
      });
  }

  public getApplicationId(): number {
      return this.getId();
  }

  public getApplicationTree$(includeBackground?: boolean): Observable<any[]> {
    const selector = includeBackground
      ? selectApplicationTree
      : selectApplicationTreeWithoutBackgroundLayers;
    return this.store$.select(selector);
  }

  public getSelectedAppLayer$(): Observable<AppLayerModel> {
    return this.store$.select(selectSelectedAppLayer)
      .pipe(map(appLayer => ({
        ...appLayer,
        serviceId: '1', // @TODO: Temporary fix
      })));
  }

  public setEditFeaturesCompleted(layerId: string) {
    this.editFeatureCompleteSubject$.next({ layerId });
  }

  public editFeaturesCompleted$(): Observable<{ layerId: string }> {
    return this.editFeatureCompleteSubject$.asObservable();
  }

  public layerFilterChangedChanged$(): Observable<{ appLayer: AppLayerModel; filter?: string | null }> {
    return this.layerFilterChangedSubject$.asObservable();
  }

  public setSelectedLayerId(layerId: string): void {
    this.store$.dispatch(setSelectedAppLayer({ layerId }));
  }

  public layerVisibilityChanged(visibility: Map<string, boolean>): void {
    this.store$.dispatch(setLayerVisibility({ visibility }));
  }

  public toggleLevelExpansion(_levelId: string): void {
  }

  public getFilterStringForLayer(layerId: string, excludeTailorMapFilters = true): string {
      return this.tailormapService.getFilterString(+(layerId), excludeTailorMapFilters);
  }

  public setFilterStringForLayer(mainFilter: string, layerId: string, _filterKey: string): void {
      this.tailormapService.setFilterString(mainFilter, +(layerId), TailorMapFilters.ATTRIBUTE_LIST);
  }

  public getFormConfigForFeatureTypeName$(layerName: string): Observable<FormConfiguration> {
    return this.store$.select(selectFormConfigForFeatureTypeName, layerName).pipe(take(1));
  }

  public getVisibleLayersWithAttributes$(): Observable<AppLayerModel[]> {
    return this.store$.select(selectVisibleLayersWithAttributes)
      .pipe(
        map(appLayers => appLayers.map(appLayer => ({
          ...appLayer,
          serviceId: '1', // @TODO: Temporary fix
        }))),
      );
  }

  public getFormConfigsLoaded$(): Observable<boolean> {
    return this.store$.select(selectFormConfigsLoaded);
  }

  public getFormConfigs$(): Observable<Map<string, ExtendedFormConfigurationModel>> {
    return this.store$.select(selectFormConfigs)
      .pipe(
        take(1),
        map((formConfigs: Map<string, LocalExtendedFormConfigurationModel>) => {
          const formConfigsMap = new Map<string, ExtendedFormConfigurationModel>();
          const formFieldTypeToFormConfigurationFieldType = (type: FormFieldType): FormConfigurationFormFieldType => {
            if (type === FormFieldType.HYPERLINK) {
              return FormConfigurationFormFieldType.HYPERLINK;
            }
            if (type === FormFieldType.DOMAIN) {
              return FormConfigurationFormFieldType.DOMAIN;
            }
            if (type === FormFieldType.HIDDEN) {
              return FormConfigurationFormFieldType.HIDDEN;
            }
            if (type === FormFieldType.SELECT) {
              return FormConfigurationFormFieldType.SELECT;
            }
            return FormConfigurationFormFieldType.TEXTFIELD;
          };
          formConfigs.forEach((config, key) => {
            const updateTabConfig: Record<number, string> = {};
            for (const idx in config.tabConfig) {
              if (config.tabConfig.hasOwnProperty(idx)) {
                updateTabConfig[idx] = config.tabConfig[idx];
              }
            }
            const updatedConfig: ExtendedFormConfigurationModel = {
              ...config,
              fields: config.fields.map(field => ({
                ...field,
                type: formFieldTypeToFormConfigurationFieldType(field.type),
              })),
              tabConfig: updateTabConfig,
              featuretypeMetadata: {
                ...config.featuretypeMetadata,
                featuretypeName: config.featuretypeMetadata?.featuretypeName || '',
                geometryAttribute: config.featuretypeMetadata?.geometryAttribute || '',
                geometryType: config.featuretypeMetadata?.geometryType,
              },
            };
            formConfigsMap.set(key, updatedConfig);
          });
          return formConfigsMap;
        }),
      );
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public getId() {
    return this.applicationId;
  }

  private updateLayerVisibility() {
    this.tailormapService.layersInitialized$
      .pipe(take(1))
      .subscribe(() => {
        const visibleLayers = this.tailormapService.getViewerController().getVisibleLayers();
        const layerVisibility = new Map<string, boolean>(visibleLayers.map(layerId => [ `${layerId}`, true ]));
        this.store$.dispatch(setLayerVisibility({ visibility: layerVisibility }));
      });
  }

}
