import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WegvakkenFormComponent } from '../wegvakken-form/wegvakken-form.component';
import { MatDialog } from '@angular/material';
import { FormFeature } from '../../shared/wegvakken-models';

export interface DialogData {
  pietje: string;
  formFeature: FormFeature;
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

  private popupOpen = false;

  @Input()
  public pietje: string;

  @Input()
  public set featureClicked(data:string){
    // convert data to FormFeature
    const ff = this.convertToFormFeature(data);
    this.openDialog(ff);
  }

  @Input()
  public set openPopup(open: string) {
    if (open === 'true') {
      this.openDialog();
    }
  }

  @Output()
  public wanneerPopupClosed = new EventEmitter<DialogClosedData>();

  public ngOnInit() {
  }
  public openDialog(formFeature ?: FormFeature): void {
    this.popupOpen = true;
    const dialogRef = this.dialog.open(WegvakkenFormComponent, {
      width: '750px',
      height: '800px',
      data: {pietje: this.pietje, formFeature},
    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      this.popupOpen = false;
      console.log('The dialog was closed');
      this.wanneerPopupClosed.emit({
        iets: 'hoi',
      });
    });
  }

  private convertToFormFeature(data: string) : FormFeature{
    return JSON.parse(data);
  }
}
