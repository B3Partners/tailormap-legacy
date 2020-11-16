import { Component, OnInit } from '@angular/core';
import { LayerService } from '../../user-interface/attributelist/layer.service';

@Component({
  selector: 'tailormap-analysis-button',
  templateUrl: './analysis-button.component.html',
  styleUrls: ['./analysis-button.component.css'],
})
export class AnalysisButtonComponent implements OnInit {

  constructor(
    private layerService: LayerService,
  ) { }

  public ngOnInit(): void {
  }

}
