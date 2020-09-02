import { async, TestBed } from '@angular/core/testing';

import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCommonModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';

describe('ConfirmDialogService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    declarations: [
      ConfirmDialogComponent
    ],
    imports: [
      NoopAnimationsModule,
      MatCommonModule,
      MatDialogModule,
      MatButtonModule,
    ],
    providers: [ ConfirmDialogService ],
  }).overrideModule(BrowserDynamicTestingModule, {
    set: {

    }
  }));

  it('should return true if confirmed', async(() => {
    const service: ConfirmDialogService = TestBed.inject(ConfirmDialogService);
    expect(service).toBeTruthy();
    const observable$ = service.confirm('Title');
    service.dialogRef.componentInstance.onConfirm();
    observable$.subscribe(confirmed => expect(confirmed).toBe(true));
  }));

  it('should return false when dismissed', async(() => {
    const service: ConfirmDialogService = TestBed.inject(ConfirmDialogService);
    expect(service).toBeTruthy();
    const observable$ = service.confirm('Title');
    service.dialogRef.componentInstance.onDismiss();
    observable$.subscribe(confirmed => expect(confirmed).toBe(false));
  }));

});
