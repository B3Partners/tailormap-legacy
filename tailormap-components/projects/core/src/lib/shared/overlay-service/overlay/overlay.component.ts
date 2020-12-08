import { Component, OnInit, TemplateRef } from '@angular/core';
import { OverlayRef } from '../overlay-ref';

@Component({
  selector: 'tailormap-overlay',
  templateUrl: './overlay.component.html',
})
export class OverlayComponent implements OnInit {

  public contentType: 'template' | 'string' | 'component';
  public context;

  constructor(
    private ref: OverlayRef,
    public content: TemplateRef<any>,
  ) {}

  public close() {
    this.ref.close(null);
  }

  public ngOnInit() {
    this.contentType = 'template';
    this.context = {
      $implicit: this.ref.data,
      close: this.ref.close.bind(this.ref),
    };
  }

}
