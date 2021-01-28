
import { AttributeListTabComponent } from './attribute-list-tab/attribute-list-tab.component';

export interface Layer {
  name: string;
  alias: string;
  id: number;
  tabComponent?: AttributeListTabComponent;
}
