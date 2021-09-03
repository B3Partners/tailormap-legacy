import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';
import { MatSelectChange } from '@angular/material/select';
import { FormConfiguration } from '../../../feature-form/form/form-models';
import { Store } from '@ngrx/store';
import { FormState } from '../../../feature-form/state/form.state';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { WORKFLOW_ACTION } from '../../../workflow/state/workflow-models';
import { WorkflowState } from '../../../workflow/state/workflow.state';
import * as WorkflowActions from '../../../workflow/state/workflow.actions';
import { selectFormConfigForFeatureTypeName, selectVisibleLayersWithFormConfig } from '../../../application/state/application.selectors';
import { TailormapAppLayer } from '../../../application/models/tailormap-app-layer.model';

@Component({
  selector: 'tailormap-add-feature-menu',
  templateUrl: './add-feature-menu.component.html',
  styleUrls: ['./add-feature-menu.component.css'],
})
export class AddFeatureMenuComponent implements OnInit, OnDestroy {

  @Output()
  public closeMenu = new EventEmitter();

  public layer: TailormapAppLayer = null;
  public layers: TailormapAppLayer[];

  private selectedConfig: FormConfiguration;
  private destroyed = new Subject();

  constructor(
    public tailorMapService: TailorMapService,
    private store$: Store<FormState | WorkflowState>,
  ) {}

  public ngOnInit(): void {
    this.store$.select(selectVisibleLayersWithFormConfig)
      .pipe(takeUntil(this.destroyed))
      .subscribe(layers => {
        this.layers = layers;
      });
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public layerSelected(event: MatSelectChange): void {
    this.layer = event.value;
    this.store$.select(selectFormConfigForFeatureTypeName, this.layer.featureTypeName)
      .pipe(take(1))
      .subscribe(formConfig => this.selectedConfig = formConfig);
  }

  public close(): void {
    this.closeMenu.emit();
  }

  public draw(type: string): void {
    this.store$.dispatch(WorkflowActions.setTypes({
      action: WORKFLOW_ACTION.ADD_FEATURE,
      geometryType: type,
      featureType: this.layer.featureTypeName,
    }));
    this.closeMenu.emit();
  }

  public isPolygon(): boolean {
    const geomtype = this.selectedConfig?.featuretypeMetadata?.geometryType;
    return geomtype === 'GEOMETRY' || geomtype === 'POLYGON' || this.noFeatureType();
  }

  public isLineString(): boolean {
    const geomtype = this.selectedConfig?.featuretypeMetadata?.geometryType;
    return geomtype === 'GEOMETRY' || geomtype === 'LINESTRING' || this.noFeatureType();
  }

  public isPoint(): boolean {
    const geomtype = this.selectedConfig?.featuretypeMetadata?.geometryType;
    return geomtype === 'GEOMETRY' || geomtype === 'POINT' || this.noFeatureType();
  }

  private noFeatureType(): boolean{
    return this.selectedConfig && !this.selectedConfig.featuretypeMetadata;
  }
}
