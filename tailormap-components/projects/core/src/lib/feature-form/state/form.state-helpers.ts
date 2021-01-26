import { selectFeatureFormOpen, selectSavedFeature } from './form.selectors';
import { combineLatest, pipe } from 'rxjs';
import { select } from '@ngrx/store';
import { filter } from 'rxjs/operators';

export const selectFormClosed = pipe(
  select(selectFeatureFormOpen),
  filter(open => !open),
);
