import { Component, Input, OnInit } from '@angular/core';
import { FormTreeMetadata } from '../form-tree-models';
import { FlatTreeModel } from '../../../shared/tree/models/flat-tree.model';

@Component({
  selector: 'tailormap-form-node',
  templateUrl: './form-node.component.html',
  styleUrls: ['../../../shared/tree/style/tree-node-style.css', './form-node.component.css'],
})
export class FormNodeComponent implements OnInit {

  @Input()
  public node: FlatTreeModel<FormTreeMetadata>;

  constructor() { }

  public ngOnInit(): void {
  }

  public isFeatureType() {
    return this.node.metadata.isFeatureType && this.node.expandable;
  }

}
