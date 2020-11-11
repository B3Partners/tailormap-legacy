import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AttributelistColumn } from './attributelist-column-models';

@Injectable({
  providedIn: 'root',
})
export class AttributelistColumnsService {
  private initColumns: AttributelistColumn[] = [];

  private messageSource = new BehaviorSubject(this.initColumns);
  public column$ = this.messageSource.asObservable();

  constructor() { }

  public changeMessage(message: AttributelistColumn[]) {
    this.messageSource.next(message)
  }
}
