import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FeatureAttribute } from '../../../feature-form/form/form-models';
import { ImageHelper } from '../../../shared/helpers/image.helper';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'tailormap-image-field',
  templateUrl: './image-field.component.html',
  styleUrls: ['./image-field.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageFieldComponent implements OnInit {

  public isImageSaved = false;
  public isImageRemoved = false;
  public imageContent: string;
  public imageError: string | null = null;

  @Input()
  public groep: FormGroup;

  @Input()
  public attribute: FeatureAttribute;

  @Input()
  public editing: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
  ) {}

  public ngOnInit(): void {}

  public fileChangeEvent($event: Event) {
    if (!this.editing) {
      return;
    }
    this.imageError = null;
    if (!$event.target || !($event.target instanceof HTMLInputElement)) {
      return;
    }
    const fileInput: HTMLInputElement = $event.target;
    if (!fileInput.files || fileInput.files.length === 0) {
      return;
    }
    const errorMsg = ImageHelper.checkSizeAndType(fileInput.files[0]);
    if (errorMsg.length > 0) {
      this.imageError = errorMsg.join('. ');
      return;
    }
    ImageHelper.readUploadAsImage$(fileInput.files[0])
      .subscribe(image => {
        if (image !== null) {
          this.imageContent = image;
          this.isImageSaved = true;
          this.isImageRemoved = false;
          this.updateValue(image);
          this.cdr.detectChanges();
        }
      });
  }

  private updateValue(img: string) {
    if (!this.editing) {
      return;
    }
    this.groep.get(this.attribute.key).setValue(img, {
      emitEvent: true,
      onlySelf: false,
      emitModelToViewChange: true,
      emitViewToModelChange: true,
    });
    this.groep.get(this.attribute.key).markAsDirty({ onlySelf: true });
  }

  public clearImage() {
    this.imageContent = null;
    this.isImageSaved = false;
    this.isImageRemoved = true;
    this.groep.get(this.attribute.key).setValue('', {
      emitEvent: true,
      onlySelf: false,
      emitModelToViewChange: true,
      emitViewToModelChange: true,
    });
    this.groep.get(this.attribute.key).markAsDirty({ onlySelf: true });
  }

  public hasUrl() {
    return !!this.getUrl();
  }

  public getUrl() {
    if (!this.attribute.value || typeof this.attribute.value !== 'string') {
      return;
    }
    return this.attribute.value;
  }

}
