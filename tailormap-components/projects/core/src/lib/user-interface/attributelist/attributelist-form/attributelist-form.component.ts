
import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { RowClickData } from '../attributelist-common/attributelist-models';
import { AttributelistPanelComponent } from '../attributelist-panel/attributelist-panel.component';
import { AttributelistService } from '../attributelist.service';

@Component({
  selector: 'tailormap-attributelist-form',
  templateUrl: './attributelist-form.component.html',
  styleUrls: ['./attributelist-form.component.css'],
})
export class AttributelistFormComponent implements OnInit {

  // Show the attribute list panel as dialog or as div.
  private showAsDialog = false;

  // Attribute list panel reference.
  @ViewChild('attrpanel') private attrPanel: AttributelistPanelComponent;

  @Input()
  public set config(value: any) {
    // console.log(value);
    this.attributelistService.config = JSON.parse(value);
  }

  // Property/function to show the attribute list panel (caution: lowercase!).
  // Argument 'dummy' is not used and therefore of type 'any'.
  @Input()
  public set showwindow(dummy: any) {
    this.doShowWindow();
  }

  @Output()
  public pageChange = new EventEmitter();

  @Output()
  public panelClose = new EventEmitter();

  @Output()
  public rowClick = new EventEmitter<RowClickData>();

  @Output()
  public tabChange = new EventEmitter();

  constructor(private dialog: MatDialog,
              private attributelistService: AttributelistService) {
  }

  public ngOnInit(): void {
    // Show window/panel on init.
    // this.doShowWindow();
  }

  private doShowWindow(): void {
    if (this.showAsDialog) {
      const config = {};
      const dlg = this.dialog.open(AttributelistPanelComponent, config);
      dlg.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    } else {
      this.attrPanel.show(true);
    }
  }

  public onPageChange(): void {
    // console.log('#Form - onPageChange');
    this.pageChange.emit();
  }

  public onPanelClose(): void {
    this.panelClose.emit();
  }

  public onRowClick(data: RowClickData): void {
    // console.log('#Form - onRowClick');
    // console.log(data);
    this.rowClick.emit(data);
  }

  public onTabChange(): void {
    // console.log('#Form - onTabChange');
    this.tabChange.emit();
  }
}
