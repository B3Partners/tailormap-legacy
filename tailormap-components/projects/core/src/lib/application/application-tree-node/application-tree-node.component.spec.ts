import { ApplicationTreeNodeComponent } from './application-tree-node.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../shared/shared.module';

describe('ApplicationTreeNodeComponent', () => {
  let spectator: Spectator<ApplicationTreeNodeComponent>;

  const createComponent = createComponentFactory({
    component: ApplicationTreeNodeComponent,
    imports: [ SharedModule ],
  });

  beforeEach(() => {
    spectator = createComponent();
    spectator.setInput("node", {
      id: 'node-1',
      label: 'Node',
      metadata: {} as any,
    });
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
