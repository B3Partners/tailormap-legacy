import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { MaatregeltoetsService } from '@b3partners/gbi-maps-components';
import { concatMap, filter, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import * as WorkflowActions from 'projects/core/src/lib/workflow/state/workflow.actions';
import { WORKFLOW_ACTION } from 'projects/core/src/lib/workflow/state/workflow-models';
import { of, Subject } from 'rxjs';
import { TailorMapService } from 'projects/bridge/src/tailor-map.service';
import { Tool } from 'projects/bridge/typings';
import { FeatureSelectionService } from 'projects/core/src/lib/shared/feature-selection/feature-selection.service';
import { Feature as CoreComponentsFeature } from '@tailormap/core-components';
import { selectAction } from '../../../core/src/lib/workflow/state/workflow.selectors';

@Injectable()
export class MaatregeltoetsWorkflowService implements OnDestroy {

  private destroyed = new Subject();

  private toolMapClick: Tool;
  private selectingFeature = false;

  constructor(
    private store$: Store,
    private maatregeltoetsService: MaatregeltoetsService,
    private tailormapService: TailorMapService,
    private featureSelectionService: FeatureSelectionService,
    private ngZone: NgZone,
  ) {
    this.maatregeltoetsService.isActive$()
      .pipe(
        takeUntil(this.destroyed),
        concatMap(active => of(active).pipe(withLatestFrom(this.store$.select(selectAction)))),
      )
      .subscribe(([ active, currentAction ]) => {
        if (active) {
          this.store$.dispatch(WorkflowActions.setAction({ action: WORKFLOW_ACTION.NO_OP }));
          this.enableMapClick();
        } else if (!!currentAction) {
          this.store$.dispatch(WorkflowActions.setAction({ action: WORKFLOW_ACTION.DEFAULT }));
          this.disableMapClick();
        }
      })
  }

  private enableMapClick() {
    if (!this.toolMapClick) {
      this.toolMapClick = this.tailormapService.getMapComponent().createTool({
        type: 22, // ToolMapClick
        id: 'anteaMaatregeltoetsClick',
        handler: {
          fn: (_, comp) => {
            this.ngZone.run(() => this.handleClick(comp.coord));
          },
        },
        viewerController: this.tailormapService.getViewerController(),
      });
    }
    this.toolMapClick.activateTool();
  }

  private disableMapClick() {
    if (!this.toolMapClick) {
      return;
    }
    this.toolMapClick.deactivateTool();
  }

  private handleClick(coords: { x: string, y: string }) {
    if (this.selectingFeature) {
      return;
    }
    const scale = Math.max(this.tailormapService.getMapComponent().getMap().getResolution() * 4, 1.2);
    const coordinates = {
      x: parseInt(coords.x),
      y: parseInt(coords.y),
      scale,
    };
    this.maatregeltoetsService.getConfig$()
      .pipe(
        take(1),
        filter(config => config.length !== 0),
        tap(() => this.selectingFeature = true),
        switchMap(config => this.featureSelectionService.selectFeatureForClick$(coordinates, false, config.map(c => c.databron))),
      )
      .subscribe(selectedFeature => {
        this.maatregeltoetsService.setCurrentFeature(selectedFeature as CoreComponentsFeature);
        this.selectingFeature = false;
      })
  }

  public ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
    if (this.toolMapClick) {
      this.toolMapClick.deactivateTool();
      this.tailormapService.getMapComponent().removeTool(this.toolMapClick);
    }
  }

}
