
import { Directive, HostBinding, HostListener, Input,
         TemplateRef, ViewContainerRef } from '@angular/core';
import { DetailsState } from '../attributelist-common/attributelist-enums';

@Directive({
  selector: '[cdkDetailsRow]'
})
export class DetailsrowDirective {

  // The parent row.
  private row: any;
  private templateRef: TemplateRef<any>;
  private isExpanded: boolean;

  @HostBinding('class.expanded')
  public get expended(): boolean {
    return this.isExpanded;
  }

  @Input()
  public set cdkDetailsRow(value: any) {
    if (value !== this.row) {
      this.row = value;
      this.row._detailsRow = this;
    }
  }

  @Input('cdkDetailsRowTpl')
  public set template(value: TemplateRef<any>) {
    if (value !== this.templateRef) {
      this.templateRef = value;
      // this.render();
    }
  }

  constructor(public vcRef: ViewContainerRef) {
  }

  private render(): void {
    this.vcRef.clear();
    if (this.templateRef && this.row) {
      this.vcRef.createEmbeddedView(this.templateRef, { $implicit: this.row });
    }
  }

  public toggle(): void {

    if (!this.row) {
      return;
    }
    if (!this.row.hasOwnProperty("related_featuretypes")) {
      return;
    }
    if (this.row.related_featuretypes.length === 0) {
      return;
    }

    if (this.isExpanded) {
      this.vcRef.clear();
    } else {
      this.render();
    }
    this.isExpanded = (this.vcRef.length > 0);

    if (this.isExpanded) {
      this.row._details = DetailsState.YesExpanded;
    } else {
      this.row._details = DetailsState.YesCollapsed;
    }
  }
}
