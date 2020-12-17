import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { clearCreateLayerMode } from '../state/analysis.actions';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import {
  selectCanCreateLayer,
  selectIsCreatingLayer,
  selectSelectedDataSource,
} from '../state/analysis.selectors';
import { takeUntil } from 'rxjs/operators';
import {
  Observable,
  Subject,
} from 'rxjs';
import { UserLayerService } from '../services/user-layer.service';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { AttributeTypeHelper } from '../../application/helpers/attribute-type.helper';
import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';
import { MatSliderChange } from '@angular/material/slider';

interface Style {
  opacity: number;
  color: string;
  strokeColor: string;
  strokeOpacity: number;
  strokeWidth: number;
}

@Component({
  selector: 'tailormap-create-layer-styling',
  templateUrl: './create-layer-styling.component.html',
  styleUrls: ['./create-layer-styling.component.css'],
})
export class CreateLayerStylingComponent implements OnInit, OnDestroy {

  public canCreateLayer: boolean;
  public isCreatingLayer: boolean;
  public selectedDataSource$: Observable<AnalysisSourceModel>;
  public visible$: Observable<boolean>;

  public style: Style = {
    opacity: 100,
    color: '',
    strokeColor: '',
    strokeOpacity: 100,
    strokeWidth: 2,
  };

  private destroyed = new Subject();

  constructor(
    private store$: Store<AnalysisState>,
    private userLayerService: UserLayerService,
  ) { }

  public ngOnInit(): void {
    this.store$.select(selectCanCreateLayer).pipe(takeUntil(this.destroyed)).subscribe(canCreateLayer => {
      this.canCreateLayer = canCreateLayer;
    });
    this.store$.select(selectIsCreatingLayer).pipe(takeUntil(this.destroyed)).subscribe(isCreatingLayer => {
      this.isCreatingLayer = isCreatingLayer;
    });
    this.selectedDataSource$ = this.store$.select(selectSelectedDataSource);
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public cancelCreateLayer() {
    this.store$.dispatch(clearCreateLayerMode());
  }

  public createLayer() {
    if (!this.canCreateLayer) {
      return;
    }
    this.userLayerService.createUserLayer();
  }

  public getGeometryTypeLabel(geometryType: AttributeTypeEnum) {
    console.log(geometryType, AttributeTypeHelper.getLabelForAttributeType(geometryType));
    return AttributeTypeHelper.getLabelForAttributeType(geometryType);
  }

  public showLineSettings(geometryType: AttributeTypeEnum) {
    return geometryType === AttributeTypeEnum.GEOMETRY_LINESTRING || geometryType === AttributeTypeEnum.GEOMETRY_POLYGON;
  }

  public showPolygonSettings(geometryType: AttributeTypeEnum) {
    return geometryType === AttributeTypeEnum.GEOMETRY_POLYGON;
  }

  public formatThumb(value: number) {
    return `${Math.round(value)}%`;
  }

  public getStrokeOpacity() {
    return this.style.strokeOpacity;
  }

  public changeStrokeColor($event: string) {
    this.style.strokeColor = $event;
  }

  public changeStrokeOpacity($event: MatSliderChange) {
    this.style.strokeOpacity = $event.value;
  }

  public changeStrokeWidth($event: MatSliderChange) {
    this.style.strokeWidth = $event.value;
  }

  public changeColor($event: string) {
    this.style.color = $event;
  }

  public changeOpacity($event: MatSliderChange) {
    this.style.opacity = $event.value;
  }

}
