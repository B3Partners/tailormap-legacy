import { Component, Input, OnInit } from '@angular/core';
import { TreeModel } from '../../../shared/tree/models/tree.model';
import { FormTreeMetadata } from '../form-tree-models';
import { FlatTreeModel } from '../../../shared/tree/models/flat-tree.model';

@Component({
  selector: 'tailormap-form-node',
  templateUrl: './form-node.component.html',
  styleUrls: ['../../../shared/tree/style/tree-node-style.css', './form-node.component.css']
})
export class FormNodeComponent implements OnInit {

  @Input()
  public node: FlatTreeModel<FormTreeMetadata>;

  constructor() { }

  public ngOnInit(): void {
  }

  public isLevel() {
    return this.node.metadata.isFeatureType && this.node.expandable;
  }

}
