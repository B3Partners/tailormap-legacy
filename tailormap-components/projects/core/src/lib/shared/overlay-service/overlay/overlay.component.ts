import { Component, OnInit, TemplateRef, Type } from '@angular/core';
import { OverlayRef } from '../overlay-ref';

@Component({
  selector: 'tailormap-overlay',
  templateUrl: './overlay.component.html',
})
export class OverlayComponent implements OnInit {

  public contentType: 'template' | 'string' | 'component';
  public content: string | TemplateRef<any> | Type<any>;
  public context;

  constructor(private ref: OverlayRef) {}

  public close() {
    this.ref.close(null);
  }

  public ngOnInit() {
    this.content = this.ref.content;

    if (typeof this.content === 'string') {
      this.contentType = 'string';
    } else if (this.content instanceof TemplateRef) {
      this.contentType = 'template';
      this.context = {
        close: this.ref.close.bind(this.ref),
      };
    } else {
      this.contentType = 'component';
    }
  }

}
