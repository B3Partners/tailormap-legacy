
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tailormap-attributelist-tab-toolbar',
  templateUrl: './attributelist-tab-toolbar.component.html',
  styleUrls: ['./attributelist-tab-toolbar.component.css'],
})
export class AttributelistTabToolbarComponent implements OnInit {

  constructor() {
  }

  public ngOnInit(): void {
  }

  public onExportClick(format: string): void {
    alert('Not yet implemented.');
  }

  public onFilterClick(): void {
    alert('Not yet implemented.');
  }

  public onSearchClick(): void {
    alert('Not yet implemented.');
  }
}
