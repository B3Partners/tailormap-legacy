import { Component, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Feature } from '../../shared/generated';
import {
  selectCreateRelationsFeature, selectCurrentlySelectedRelatedFeature,
  selectFormRelationsForCurrentFeature,
} from '../state/form.selectors';
import { Subject } from 'rxjs';
import { FormChildRelation, FormRelationModel } from '../state/form-relation.model';
import { FormTreeHelpers } from '../form-tree/form-tree-helpers';
import { selectFormConfigs } from '../../application/state/application.selectors';
import { ExtendedFormConfigurationModel } from '../../application/models/extended-form-configuration.model';
import { skip, take, takeUntil } from 'rxjs/operators';
import {
  allowRelationSelection, clearNetworkHighlight, closeRelationsForm, removeNetworkHighlightFeature, toggleNetworkHighlightFeature,
} from '../state/form.actions';
import { FormActionsService } from '../form-actions/form-actions.service';
import { FeatureUpdateHelper } from '../../shared/feature-initializer/feature-update.helper';

@Component({
  selector: 'tailormap-create-relations',
  templateUrl: './create-relations.component.html',
  styleUrls: ['./create-relations.component.css'],
})
export class CreateRelationsComponent implements OnDestroy {

  public featureRelations: FormRelationModel;
  private formConfigs: Map<string, ExtendedFormConfigurationModel>;
  private destroyed = new Subject();
  private feature: Feature;
  public currentRelation: FormChildRelation;
  private changedRelations: Record<string, any> = {};
  private changedRelationGeom: Record<string, string> = {};

  public creatingRelation = false;
  public displayedColumns: string[] = ['label', 'add', 'currentRelation', 'removeRelation'];
  public hasChangedRelation = false;

  constructor(
    private store$: Store,
    private formActionsService: FormActionsService,
  ) {
    this.store$.select(selectFormConfigs)
      .pipe(takeUntil(this.destroyed))
      .subscribe(formConfigs => this.formConfigs = formConfigs);
    this.store$.select(selectCreateRelationsFeature)
      .pipe(takeUntil(this.destroyed))
      .subscribe(feature => this.feature = feature);
    this.store$.select(selectFormRelationsForCurrentFeature)
      .pipe(takeUntil(this.destroyed))
      .subscribe(featureRelations => this.featureRelations = featureRelations);
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public getFeatureName() {
    return FormTreeHelpers.getFeatureValueForField(this.feature, this.formConfigs.get(this.feature.tableName));
  }

  public getLayerName() {
    return this.feature.layerName;
  }

  public save() {
    if (!this.hasChangedRelation) {
      return;
    }
    const updatedFeature: Feature = FeatureUpdateHelper.updateFeatureAttributes(this.feature, this.changedRelations);
    this.formActionsService.save$(updatedFeature).subscribe(() => {
      this.store$.dispatch(closeRelationsForm());
    });
  }

  public cancel() {
    this.store$.dispatch(closeRelationsForm());
  }

  public createRelation(relation: FormChildRelation) {
    this.currentRelation = relation;
    this.creatingRelation = true;
    this.store$.dispatch(allowRelationSelection({ allowedFeatureTypes: [ relation.featureType ] }));
    this.store$.dispatch(clearNetworkHighlight());
    this.store$.select(selectCurrentlySelectedRelatedFeature)
      .pipe(skip(1), take(1))
      .subscribe(feature => {
        this.hasChangedRelation = true;
        if (feature === null || !this.creatingRelation) {
          return;
        }
        this.creatingRelation = false;
        const relationAttribute = feature.attributes.find(a => a.key === relation.referenceColumn);
        if (!relationAttribute) {
          return;
        }
        this.changedRelationGeom[relation.column] = feature.defaultGeometry;
        this.changedRelations[relation.column] = relationAttribute.value;
      });
  }

  public cancelLinking() {
    this.creatingRelation = false;
  }

  public isChangedRelation(relation: FormChildRelation) {
    return this.changedRelations.hasOwnProperty(relation.column);
  }

  public getChangedRelationValue(relation: FormChildRelation) {
    return this.changedRelations[relation.column];
  }

  public relationHasGeometry(relation: FormChildRelation) {
    if (this.isChangedRelation(relation)) {
      return !!this.changedRelationGeom[relation.column];
    }
    return !!relation.geometry;
  }

  public relationClicked($event: MouseEvent, relation: FormChildRelation) {
    $event.preventDefault();
    $event.stopPropagation();
    const changedRelation = this.getChangedRelationValue(relation);
    if (!!changedRelation) {
      const geom = this.changedRelationGeom[relation.column];
      if (geom) {
        this.store$.dispatch(toggleNetworkHighlightFeature({ fid: changedRelation, geom }));
      }
    } else if (!!relation.geometry) {
      this.store$.dispatch(toggleNetworkHighlightFeature({ fid: relation.currentRelation, geom: relation.geometry }));
    }
  }

  public removeRelation(relation: FormChildRelation) {
    const changedRelation = this.getChangedRelationValue(relation);
    this.changedRelations[relation.column] = '';
    this.changedRelationGeom[relation.column] = '';
    this.store$.dispatch(removeNetworkHighlightFeature({ fid: !!changedRelation ? changedRelation : relation.currentRelation }));
    this.hasChangedRelation = true;
  }

  public isEmptyRelation(relation: FormChildRelation) {
    if (this.isChangedRelation(relation)) {
      return !this.changedRelations[relation.column];
    }
    return !relation.currentRelation;
  }

  public getIcon(relation: FormChildRelation) {
    if (this.isEmptyRelation(relation)) {
      return 'close';
    }
    return 'check';
  }

  public getTooltip(relation: FormChildRelation) {
    if (this.isChangedRelation(relation)) {
      return this.getChangedRelationValue(relation);
    }
    return relation.currentRelation;
  }

}
