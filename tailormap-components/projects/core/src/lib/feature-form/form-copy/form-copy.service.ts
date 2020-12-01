import { Injectable } from '@angular/core';
import { Feature } from '../../shared/generated';

@Injectable({
  providedIn: 'root',
})
export class FormCopyService {

  public featuresToCopy = new Map<string, Map<string, string>>();

  public parentFeature: Feature;

  constructor() {
  }
}
