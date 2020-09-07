import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TailorMapService {

  constructor() { }

  public getAppLoader(): AppLoader {
    return (window as any).FlamingoAppLoader as AppLoader;
  }

  public getContextPath(): string {
    return this.getAppLoader().get('contextPath') as string;
  }

  public getViewerController(): ViewerController {
    return this.getAppLoader().get('viewerController') as ViewerController;
  }
}
