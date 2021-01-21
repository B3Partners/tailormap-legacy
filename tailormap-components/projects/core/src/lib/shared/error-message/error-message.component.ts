import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'tailormap-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {

  @Input()
  public errorMessage: string;

  constructor() { }
}
