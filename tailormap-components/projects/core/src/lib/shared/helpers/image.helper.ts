import { Observable, Subject } from 'rxjs';

export class ImageHelper {

  public static checkSizeAndType(file: File, maxSize = 2): string[] {
    const result = [];
    if (file.size > (maxSize * 1000 * 1000)) {
      result.push('Maximum size allowed is ' + maxSize + 'MB');
    }
    if (!(/image\//.test(file.type))) {
      result.push('Only images are allowed.');
    }
    return result;
  }

  public static readUploadAsImage$(file: File): Observable<string> {
    const subject = new Subject<string>();
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target.result instanceof ArrayBuffer
        ? ImageHelper.bufferToBase64(e.target.result)
        : e.target.result;
      const image = new Image();
      image.src = result;
      image.onload = (_) => {
        subject.next(result);
        subject.complete();
      };
      image.onerror = () => {
        subject.next(null);
        subject.complete();
      };
    };
    reader.readAsDataURL(file);
    return subject.asObservable();
  }

  private static bufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }

}
