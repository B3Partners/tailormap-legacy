import { Spectator, createComponentFactory, byTextContent } from '@ngneat/spectator';
import { ResolutionSelectorComponent } from './resolution-selector.component';
import { SharedModule } from '../../shared/shared.module';

describe('ResolutionSelectorComponent', () => {
  let spectator: Spectator<ResolutionSelectorComponent>;
  const createComponent = createComponentFactory({
    component: ResolutionSelectorComponent,
    imports: [
      SharedModule,
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should emit changed resolution after selecting', () => {
    spectator.setInput('selectedScale', 1500);
    expect(spectator.query('.mat-select-value-text').textContent).toEqual('1 / 1.500');

    let changedScale: number;
    spectator.output('scaleChanged').subscribe((value: number) => {
      changedScale = value;
    });
    spectator.click('.mat-select-trigger');
    spectator.detectChanges();
    spectator.click(byTextContent('1 / 750 (straat)', {selector: '.mat-option'}));

    expect(changedScale).toEqual(750);
  });

});
