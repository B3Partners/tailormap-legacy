import { CriteriaGroupComponent } from './criteria-group.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SharedModule } from '../../../shared/shared.module';
import { IdService } from '../../../shared/id-service/id.service';

describe('CriteriaGroupComponent', () => {
  let spectator: Spectator<CriteriaGroupComponent>;

  const createComponent = createComponentFactory({
    component: CriteriaGroupComponent,
    imports: [ SharedModule ],
    providers: [
      IdService,
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
