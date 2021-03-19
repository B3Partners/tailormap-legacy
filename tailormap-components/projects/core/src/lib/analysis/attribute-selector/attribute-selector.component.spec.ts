import { AttributeSelectorComponent } from './attribute-selector.component';
import { SharedModule } from '../../shared/shared.module';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { getMetadataServiceMockProvider } from '../../application/services/mocks/metadata.service.mock';
import { PassportAttributeModel } from '../../application/models/passport-attribute.model';
import { Observable, of } from 'rxjs';
import { mockAttribute } from '../../shared/tests/test-data';
import { AttributeTypeEnum } from '../../application/models/attribute-type.enum';

const setInputs = (spectator: Spectator<AttributeSelectorComponent>) => {
  spectator.setInput('appLayerId', 1);
  spectator.setInput('featureType', 1);
  spectator.setInput('selectedAttribute', '');
  spectator.detectChanges();
};

describe('AttributeSelectorComponent', () => {

  let spectator: Spectator<AttributeSelectorComponent>;

  const createComponent = createComponentFactory({
    component: AttributeSelectorComponent,
    imports: [SharedModule],
    providers: [
      getMetadataServiceMockProvider({
        getPassportFieldsForLayer$(layerId: string | number): Observable<PassportAttributeModel[]> {
          return of<PassportAttributeModel[]>([
            {...mockAttribute({name: 'att1', featureType: 1, type: 'string'}), passportAlias: 'Attribute 1'},
            {...mockAttribute({name: 'att2', featureType: 1, type: 'string'}), passportAlias: 'Attribute 2'},
            {...mockAttribute({name: 'att3', featureType: 1, type: 'string'}), passportAlias: 'Attribute 3'},
            {...mockAttribute({name: 'att4', featureType: 1, type: 'string'}), passportAlias: 'Attribute 4'},
          ]);
        },
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });

  it('should render autocomplete with options', async () => {
    setInputs(spectator);
    let selectedAttribute: string;
    spectator.output('attributeSelected').subscribe(($event: { attribute: PassportAttributeModel; attributeType: AttributeTypeEnum }) => {
      selectedAttribute = $event.attribute.name;
    });
    spectator.triggerEventHandler('input', 'focusin', {});
    await spectator.fixture.whenStable();
    spectator.detectChanges();
    const options = document.querySelectorAll('mat-option');
    expect(options.length).toBe(4);
    (options[0] as HTMLElement).click();
    spectator.detectChanges();
    expect(spectator.query<HTMLInputElement>('input').value).toEqual('Attribute 1');
    expect(selectedAttribute).toEqual('att1');
  });

  it('should trigger attribute selected when entering valid attribute name', async () => {
    setInputs(spectator);
    let selectedAttribute: string;
    spectator.output('attributeSelected').subscribe(($event: { attribute: PassportAttributeModel; attributeType: AttributeTypeEnum }) => {
      selectedAttribute = $event.attribute.name;
    });
    spectator.detectChanges();
    spectator.typeInElement('att2', 'input');
    await spectator.fixture.whenStable();
    spectator.detectChanges();
    const options = document.querySelectorAll('mat-option');
    expect(options.length).toBe(1);
    (options[0] as HTMLElement).click();
    spectator.detectChanges();
    expect(spectator.query<HTMLInputElement>('input').value).toEqual('Attribute 2');
    expect(selectedAttribute).toEqual('att2');
  });

  it('should not trigger selected attribute for unknown atribute', async () => {
    setInputs(spectator);
    let selectedAttribute: string;
    spectator.output('attributeSelected').subscribe(($event: { attribute: PassportAttributeModel; attributeType: AttributeTypeEnum }) => {
      selectedAttribute = $event.attribute.name;
    });
    spectator.detectChanges();
    spectator.typeInElement('unknown', 'input');
    spectator.detectChanges();
    expect(spectator.query<HTMLInputElement>('input').value).toEqual('unknown');
    expect(selectedAttribute).toBeUndefined();
  });

});
