import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TreeModel } from '../../shared/tree/models/tree.model';
import { TreeService } from '../../shared/tree/tree.service';
import { TransientTreeHelper } from '../../shared/tree/helpers/transient-tree.helper';
import {
  AppLayer,
  Level,
} from '../../../../../bridge/typings';
import {
  combineLatest,
  Subject,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApplicationTreeHelper } from '../../application/helpers/application-tree.helper';
import { AnalysisSourceModel } from '../models/analysis-source.model';
import { Store } from '@ngrx/store';
import { AnalysisState } from '../state/analysis.state';
import { selectApplicationTreeWithoutBackgroundLayers } from '../../application/state/application.selectors';
import { selectSelectedDataSource } from '../state/analysis.selectors';
import {
  selectDataSource,
  setSelectedDataSource,
} from '../state/analysis.actions';

@Component({
  selector: 'tailormap-create-layer-layer-selection',
  templateUrl: './create-layer-layer-selection.component.html',
  styleUrls: ['./create-layer-layer-selection.component.css', '../../application/style/application-tree.css'],
  providers: [
    TreeService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateLayerLayerSelectionComponent implements OnInit, OnDestroy {

  private destroyed = new Subject();
  private transientTreeHelper: TransientTreeHelper<AppLayer | Level>;

  constructor(
    private store$: Store<AnalysisState>,
    private treeService: TreeService,
  ) {
  }

  public ngOnInit(): void {
    combineLatest([
      this.store$.select(selectApplicationTreeWithoutBackgroundLayers),
      this.store$.select(selectSelectedDataSource),
    ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(([ tree, selectedDataSource ]) => {
        this.createTree(tree, selectedDataSource);
      });

    this.treeService.checkStateChangedSource$
      .pipe(takeUntil(this.destroyed))
      .subscribe(changed => {
        const checkedLayer = Array.from(changed.entries()).find(val => val[1]);
        if (!checkedLayer) {
          return;
        }
        const appLayer = this.treeService.getNode(checkedLayer[0]).metadata;
        const source: AnalysisSourceModel = {
          layerId: +(appLayer.id),
          featureType: appLayer.featureType,
          label: appLayer.alias,
        };
        this.store$.dispatch(setSelectedDataSource({ source }));
      });
  }

  public ngOnDestroy() {
    this.transientTreeHelper.destroy();
    this.destroyed.next();
    this.destroyed.complete();
  }

  public closePanel() {
    this.store$.dispatch(selectDataSource({ selectDataSource: false }));
  }

  private createTree(tree: TreeModel[], selectedDataSource: AnalysisSourceModel) {
    this.transientTreeHelper = new TransientTreeHelper(
      this.treeService,
      tree,
      true,
      node => {
        return !!selectedDataSource
          && ApplicationTreeHelper.isAppLayer(node.metadata)
          && node.metadata.id === `${selectedDataSource.layerId}`;
      },
    );
  }
}
