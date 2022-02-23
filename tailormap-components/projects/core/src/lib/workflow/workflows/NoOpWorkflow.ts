import { Workflow } from './Workflow';

export class NoOpWorkflow extends Workflow {

  public afterEditing(): void {
  }

  public geometryDrawn(): void {
  }

  public mapClick(): void {
  }

}
