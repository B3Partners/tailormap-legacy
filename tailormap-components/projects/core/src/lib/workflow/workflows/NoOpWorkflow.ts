import { Workflow } from './Workflow';
import { Feature } from '../../shared/generated';

export class NoOpWorkflow extends Workflow {

  public afterEditting(): void {
  }

  public geometryDrawn(): void {
  }

  public getDestinationFeatures(): Feature[] {
    return [];
  }

  public mapClick(): void {
  }

}
