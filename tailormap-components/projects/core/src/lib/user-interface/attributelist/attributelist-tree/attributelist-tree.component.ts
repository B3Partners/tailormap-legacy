import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TreeDialogData, FlatNode, AttributelistNode } from './attributelist-tree-models';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
} from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { AttributelistService } from '../attributelist.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Feature } from '../../../shared/generated';
import { FormComponent } from '../../../feature-form/form/form.component';

@Component({
  selector: 'tailormap-attributelist-tree',
  templateUrl: './attributelist-tree.component.html',
  styleUrls: ['./attributelist-tree.component.css'],
})
export class AttributelistTreeComponent implements OnDestroy, OnInit {

  private destroyed = new Subject();

  public treeControl = new FlatTreeControl<FlatNode>(node => node.level, node => node.expandable);

  public treeFlattener = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.children);

  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(public dialogRef: MatDialogRef<AttributelistTreeComponent>,
              @Inject(MAT_DIALOG_DATA) public data: TreeDialogData,
              private attributelistService: AttributelistService,
              private dialog: MatDialog) {
    this.dataSource.data = data.tree;
    this.treeControl.expandAll();
  }

  private _transformer(node: AttributelistNode, level: number) {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      numberOfFeatures: node.numberOfFeatures,
      level,
      columnNames: node.columnNames,
      features: node.features,
      formFeatures: node.formFeatures,
      params: node.params,
      isChild: node.isChild,
    };
  }

  private openPasportDialog(formFeatures : Feature[]): void {
    const dialogRef = this.dialog.open(FormComponent, {
      width: '1050px',
      height: '800px',
      disableClose: true,
      data: {
        formFeatures ,
        isBulk: formFeatures .length > 1,
      },
    });
    // tslint:disable-next-line: rxjs-no-ignored-subscription
    dialogRef.afterClosed().subscribe(result => {
      console.log('pasportform closed');
    });
  }

  public closeDialog() {
    this.dialogRef.close('tree gesloten');
  }

  public click(node: AttributelistNode) {
    this.attributelistService.setSelectedTreeData({
      features: node.features,
      columnNames: node.columnNames,
      params: node.params,
      name: node.name,
      isChild: node.isChild,
    });
  }

  public ngOnInit(): void {
    this.attributelistService.updateTreeData$.pipe(takeUntil(this.destroyed)).subscribe(treeData => {
      this.dataSource.data = treeData;
      this.treeControl.expandAll();
    });
  }

  public ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  public openPasportForm(): void {
    this.openPasportDialog(this.dataSource.data[0].formFeatures);
  }

  public hasChild = (_: number, node: FlatNode) => node.expandable;
}
