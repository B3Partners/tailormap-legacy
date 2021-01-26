import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'tailormap-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.css'],
})
export class MenuButtonComponent implements OnInit {

  @Input()
  public icon: string;

  @Input()
  public enabled: boolean;

  @Output()
  public clicked: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {
  }

  public ngOnInit(): void {
  }

  public click(): void {
    if (this.enabled) {
      this.clicked.emit(true);
    }
  }

}
