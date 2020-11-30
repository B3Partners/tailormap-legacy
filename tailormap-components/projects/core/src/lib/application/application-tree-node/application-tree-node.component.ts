import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  AppLayer,
  Level,
} from '../../../../../bridge/typings';
import { ApplicationTreeHelper } from '../helpers/application-tree.helper';
import { TreeModel } from '../../shared/tree/models/tree.model';

@Component({
  selector: 'tailormap-application-tree-node',
  templateUrl: './application-tree-node.component.html',
  styleUrls: ['../../shared/tree/style/tree-node-style.css', './application-tree-node.component.css'],
})
export class ApplicationTreeNodeComponent {

  @Input()
  public node: TreeModel<AppLayer | Level>;

  constructor() { }

  public isLevel() {
    return ApplicationTreeHelper.isLevel(this.node.metadata);
  }

}
