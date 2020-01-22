import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WegvakkenFormComponent } from '../wegvakken-form/wegvakken-form.component';
import { MatDialog } from '@angular/material';

export interface DialogData {
  pietje: string;
}

export interface DialogClosedData {
  iets: string;
}

@Component({
  selector: 'flamingo-wegvak-popup',
  templateUrl: './wegvak-popup.component.html',
  styleUrls: ['./wegvak-popup.component.css'],
})
export class WegvakPopupComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  @Input()
  public pietje: string;

  @Input()
  public set popupOpen(open: string) {
    if (open === 'true') {
      this.openDialog();
    }
  }

  @Output()
  public wanneerPopupClosed = new EventEmitter<DialogClosedData>();

  public ngOnInit() {
  }
  public openDialog(): void {
    const dialogRef = this.dialog.open(WegvakkenFormComponent, {
      width: '250px',
      data: {pietje: this.pietje},
    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.wanneerPopupClosed.emit({
        iets: 'hoi',
      });
    });
  }
}
