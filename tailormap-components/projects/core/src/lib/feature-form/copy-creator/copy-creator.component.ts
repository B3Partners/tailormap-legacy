import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormConfiguration } from '../form/form-models';

@Component({
  selector: 'tailormap-copy-creator',
  templateUrl: './copy-creator.component.html',
  styleUrls: ['./copy-creator.component.css'],
})
export class CopyCreatorComponent implements OnInit {

  public fieldsToCopy = new Map<string, string>();

  @Input()
  public formConfig: FormConfiguration;

  constructor() { }

  public ngOnInit(): void {
    for (let field = 0; field < this.formConfig.fields.length; field++) {
      this.fieldsToCopy.set(this.formConfig.fields[field].label, this.formConfig.fields[field].key);
    }
    console.log('done');
  }

}
