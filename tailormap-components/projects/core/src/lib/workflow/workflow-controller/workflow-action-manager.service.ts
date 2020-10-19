import { Injectable } from '@angular/core';
import {
  WORKFLOW_ACTION,
  WorkflowActionEvent,
} from './workflow-models';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkflowActionManagerService {

  public actionChanged$: Subject<WorkflowActionEvent> = new Subject<WorkflowActionEvent>();
  constructor() {
  }

  public setAction(event: WorkflowActionEvent){
    this.actionChanged$.next(event);
  }

}

