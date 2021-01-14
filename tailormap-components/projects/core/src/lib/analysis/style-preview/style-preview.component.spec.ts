import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { StylePreviewComponent } from './style-preview.component';

describe('StylePreviewComponent', () => {
  let spectator: Spectator<StylePreviewComponent>;
  const createComponent = createComponentFactory(StylePreviewComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
