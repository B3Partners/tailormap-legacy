import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { MatToolbar } from '@angular/material/toolbar';
import { LayoutService } from '../../layout.service';
import { LayoutConfig } from '../../layout-config';
import { LayoutComponent } from '../../models';
import { Dock } from '../../enums';

import { PanelResizerComponent } from '../../panel-resizer/panel-resizer.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { AttributeListState } from '../state/attribute-list.state';
import { setAttributeListVisibility, setSelectedTab } from '../state/attribute-list.actions';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { selectAttributeListTabs } from '../state/attribute-list.selectors';
import { AttributeListTabModel } from '../models/attribute-list-tab.model';

@Component({
  selector: 'tailormap-attribute-list-panel',
  templateUrl: './attribute-list-panel.component.html',
  styleUrls: ['./attribute-list-panel.component.css'],
})
export class AttributeListPanelComponent implements OnInit, AfterViewInit, LayoutComponent {

  // For the layout service.
  @ViewChild('captionbar')
  public captionbar: MatToolbar;

  @ViewChild('panelResizer')
  public panelResizer: PanelResizerComponent;

  public layoutConfig: LayoutConfig;
  public tabs: AttributeListTabModel[];

  // The height of the caption bar.
  private captionbarHeight = 30;
  private destroyed = new Subject();

  constructor(
    private store$: Store<AttributeListState>,
    private elementRef: ElementRef,
    private layoutService: LayoutService,
  ) {
  }

  public ngOnInit(): void {
    this.store$.select(selectAttributeListTabs)
      .pipe(takeUntil(this.destroyed))
      .subscribe(tabs => {
        this.tabs = tabs;
      });
  }

  public ngAfterViewInit(): void {
    // console.log('#Panel.ngAfterViewInit');
    // Set layout config settings.
    this.layoutConfig = new LayoutConfig(this.elementRef, this.panelResizer);
    this.layoutConfig.dock = Dock.Bottom;
    // this.layoutConfig.initialHeight = 300;
    // this.layoutConfig.initialHeight = 250;
    this.layoutConfig.initialHeight = 350;
    // Register panel.
    this.layoutService.register(this);
  }

  public getCaptionbarHeight(): number {
    return this.captionbarHeight;
  }

  public onMaximizeClick(): void {
    this.layoutService.maximize(this);
  }

  public onMinimizeClick(): void {
    this.layoutService.minimize(this);
  }

  public onCloseClick(): void {
    this.store$.dispatch(setAttributeListVisibility({visible: false}));
  }

  public onSelectedTabChange($event: MatTabChangeEvent): void {
    this.store$.dispatch(setSelectedTab({ layerId: this.tabs[$event.index].layerId }));
  }

  public trackByLayerId(layer) {
    return layer.id;
  }

  public onTableOptionsClick($event: MouseEvent, index: AttributeListTabModel) {
    alert('implement options popup');
    // // Get the target for setting the dialog position.
    // let target = null;
    // if (evt !== null) {
    //   target = new ElementRef(evt.currentTarget);
    // }
    //
    // // Create and set the dialog config.
    // const config = new MatDialogConfig();
    //
    // // Show transparent backdrop, click outside dialog for closing.
    // config.backdropClass = 'cdk-overlay-backdrop';
    //
    // // Possible additional settings:
    // //     config.hasBackdrop = false;     // Don't show a gray mask.
    // //     config.maxHeight = '100px';
    // //     config.height = '300px';
    // //     config.panelClass = 'attributelist-table-options-form';
    //
    // config.data = {
    //   trigger: target,
    //   columnController: this.dataSource.columnController,
    // };
    // const dialogRef = this.dialog.open(AttributelistTableOptionsFormComponent, config);
    // dialogRef.afterClosed().subscribe(value => {
    //   // Collapse all rows.
    //   this.dataSource.resetExpanded();
    // });
  }
}
