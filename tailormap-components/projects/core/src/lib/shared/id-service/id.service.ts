import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdService {

  private idsByPrefix: { [key: string]: number } = {};

  constructor() {}

  public getUniqueId(prefix: string): string {
    const nextId = this.idsByPrefix[prefix] + 1 || 1;
    this.idsByPrefix[prefix] = nextId;
    return `${prefix}-${nextId}`;
  }

  public startNewSession() {
    this.idsByPrefix = {};
  }

}
