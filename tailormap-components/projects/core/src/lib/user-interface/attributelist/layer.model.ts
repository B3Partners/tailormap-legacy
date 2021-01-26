
import { AttributelistTabComponent } from './attributelist-tab/attributelist-tab.component';

export interface Layer {
  name: string;
  alias: string;
  id: number;
  tabComponent?: AttributelistTabComponent;
}
