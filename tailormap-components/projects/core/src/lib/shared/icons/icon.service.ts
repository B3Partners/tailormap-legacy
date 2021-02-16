import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../../bridge/src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IconService {

  public icons: Array<string | { folder: string, icons: string[] }> = [
    'draw_polygon', 'draw_line', 'draw_point', 'split', 'new_object', 'merge',
    'contextual_drag', 'contextual_resize', 'contextual_chevron_bottom', 'contextual_chevron_left', 'contextual_chevron_right', 'contextual_chevron_top',
    'contextual_close', 'contextual_minimize', 'contextual_drop_down', 'contextual_drop_top',
    'contextual_expand_close', 'contextual_expand_open',
    'interface_trash_filled',
    { folder: 'markers', icons: [ 'arrow', 'circle', 'cross', 'square', 'star', 'triangle', 'x' ] },
    { folder: 'components', icons: [ 'attributelist' ] },
  ];

  constructor(

  ) {}

  public getUrl() {
    const basePath = environment.basePath || '';
    return `${basePath}/assets/core/imgs/`;
  }

  public getUrlForIcon(icon: string, folder?: string) {
    const path = [ this.getUrl() ];
    if (folder) {
      path.push(folder, '/');
    }
    path.push(icon, '.svg');
    return path.join('');
  }

  public loadIconsToIconRegistry(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    const addIcon = (iconName, iconFile, folder?: string) => {
      matIconRegistry.addSvgIcon(
        iconName,
        domSanitizer.bypassSecurityTrustResourceUrl(this.getUrlForIcon(iconFile, folder)),
      );
    }
    this.icons.forEach(value => {
      if (typeof value === 'string') {
        addIcon(value, value);
        return;
      }
      value.icons.forEach(folderIcon => {
        addIcon(`${value.folder}_${folderIcon}`, folderIcon, value.folder);
      });
    });
  }

}
