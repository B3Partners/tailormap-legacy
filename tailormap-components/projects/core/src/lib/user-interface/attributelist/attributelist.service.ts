/**
 * Service for config settings.
 */

import { Injectable } from '@angular/core';
import { AttributelistConfig } from './attributelist-common/attributelist-models';

@Injectable({
  providedIn: 'root',
})
export class AttributelistService {

  public config: AttributelistConfig;

}
