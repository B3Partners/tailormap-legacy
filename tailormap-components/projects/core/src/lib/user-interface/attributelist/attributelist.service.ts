/**
 * Service for config settings.
 */

import { Injectable } from '@angular/core';
import { AttributelistConfig } from './models/attributelist.config';
import { Subject } from 'rxjs';
import {
  AttributelistNode,
  SelectedTreeData,
} from './attributelist-tree/attributelist-tree-models';

@Injectable({
  providedIn: 'root',
})
export class AttributelistService {

  public config: AttributelistConfig;

  private loadTableDataSubject$ = new Subject();

  private afterLoadRelatedDataSubject$ = new Subject();

  private updateTreeDataSubject$ = new Subject<AttributelistNode[]>();

  private selectedTreeDataSubject$ = new Subject<SelectedTreeData>(); // source voor Observable

  public loadTableData$ = this.loadTableDataSubject$.asObservable();

  public afterLoadRelatedData$ = this.afterLoadRelatedDataSubject$.asObservable();

  public updateTreeData$ = this.updateTreeDataSubject$.asObservable();

  public selectedTreeData$ = this.selectedTreeDataSubject$.asObservable(); // ingang naar Observable

  public loadTableData(clazzName: string): void {
    this.loadTableDataSubject$.next(clazzName);
  }

  public afterLoadRelatedData(): void {
    this.afterLoadRelatedDataSubject$.next();
  }

  public updateTreeData(treeData: AttributelistNode[]): void {
    this.updateTreeDataSubject$.next(treeData);
  }

  public setSelectedTreeData(selectedTreeData: SelectedTreeData): void {
    this.selectedTreeDataSubject$.next(selectedTreeData);
  }
}
