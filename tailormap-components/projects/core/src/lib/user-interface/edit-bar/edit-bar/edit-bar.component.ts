import {
  Component,
  OnInit,
} from '@angular/core';
import { DialogData } from '../../../feature-form/form/form-models';
import { FormComponent } from '../../../feature-form/form/form.component';
import { MatDialog } from '@angular/material/dialog';
import { AddFeatureMenuComponent } from '../add-feature-menu/add-feature-menu.component';
import { TailorMapService } from '../../../../../../bridge/src/tailor-map.service';

@Component({
  selector: 'tailormap-edit-bar',
  templateUrl: './edit-bar.component.html',
  styleUrls: ['./edit-bar.component.css'],
})
export class EditBarComponent implements OnInit {

  constructor(
    private tailorMapService: TailorMapService,
    public dialog: MatDialog) {
  }

  public ngOnInit(): void {
  }

  public onEdit(): void {

    const dialogRef = this.dialog.open(AddFeatureMenuComponent, {
      width: '400px',
      position: {
        top: '200px',
        left: '500px',
      },
      height: '100px',
      disableClose: true,
      hasBackdrop: false,

    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      //  this.afterEditting(result);
    });
    //  alert('not yet implemented');
  }

  public hasSplit(): boolean {
    const vc = this.tailorMapService.getViewerController();
    const comps = vc.getComponentsByClassNames(['viewer.components.Split']);
    return comps.length > 0;
  }

  public hasMerge(): boolean {
    const vc = this.tailorMapService.getViewerController();
    const comps = vc.getComponentsByClassNames(['viewer.components.Merge']);
    return comps.length > 0;
  }

  public onSplit(): void {
    this.tailorMapService.openSplitComponent();
  }

  public onMerge(): void {
    this.tailorMapService.openMergeComponent();
  }
}
