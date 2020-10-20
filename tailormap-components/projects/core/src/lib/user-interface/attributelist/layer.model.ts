
import { AttributelistTabComponent } from './attributelist-tab/attributelist-tab.component';

export interface Layer {
  name: string;
  id: number;
  tabComponent?: AttributelistTabComponent;
}
