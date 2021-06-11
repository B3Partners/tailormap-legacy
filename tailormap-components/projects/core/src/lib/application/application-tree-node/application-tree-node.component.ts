import {
  Component,
  Input,
} from '@angular/core';
import {
  AppLayer,
  Level,
} from '../../../../../bridge/typings';
import { ApplicationTreeHelper } from '../helpers/application-tree.helper';
import { TreeModel } from '@tailormap/shared';

@Component({
  selector: 'tailormap-application-tree-node',
  templateUrl: './application-tree-node.component.html',
  styleUrls: ['./application-tree-node.component.css'],
})
export class ApplicationTreeNodeComponent {

  @Input()
  public node: TreeModel<AppLayer | Level>;

  constructor() { }

  public isLevel() {
    return ApplicationTreeHelper.isLevel(this.node.metadata);
  }

}
