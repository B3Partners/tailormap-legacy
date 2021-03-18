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

  it('should filter options based on min scale', () => {
    spectator.setInput('minScale', 384000);
    spectator.click('.mat-select-trigger');
    spectator.detectChanges();
    expect(spectator.queryAll('mat-option').length).toEqual(3);
    const optionLabels = [
      spectator.queryAll('mat-option')[0].textContent,
      spectator.queryAll('mat-option')[1].textContent,
      spectator.queryAll('mat-option')[2].textContent,
    ];
    expect(optionLabels).toEqual([
      'Altijd tonen',
      '1 / 1.536.000 (land)',
      '1 / 768.000',
    ]);
  });

  it('should filter options based on max scale', () => {
    spectator.setInput('maxScale', 1500);
    spectator.click('.mat-select-trigger');
    spectator.detectChanges();
    expect(spectator.queryAll('mat-option').length).toEqual(3);
    const optionLabels = [
      spectator.queryAll('mat-option')[0].textContent,
      spectator.queryAll('mat-option')[1].textContent,
      spectator.queryAll('mat-option')[2].textContent,
    ];
    expect(optionLabels).toEqual([
      'Altijd tonen',
      '1 / 750 (straat)',
      '1 / 375',
    ]);
  });

});
