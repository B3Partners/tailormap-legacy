import {Component, ElementRef, ViewChild} from '@angular/core';
import {ConfigObject} from "@tailormap/admin-config/lib/forms/formshared/models/config-object";
import {SaveReponse} from "@tailormap/admin-config/lib/forms/formshared/models/formresponse";
import {Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {catchError, map} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tailormap-admin-config';
  @ViewChild('jan') jan!:ElementRef;
  @ViewChild('piet') piet!:ElementRef;

  constructor(private http: HttpClient) {
  }
  public run(){
    const form : ConfigObject = {
      featureSourceId: 0,
      featureType: "",
      featureTypeId: 0,
      fields: [],
      name: "",
      newPossible: false,
      tabConfig: {},
      tabs: 0,
      treeNodeColumn: ""

    };
    this.piet.nativeElement.value =JSON.stringify(form);
    this.jan.nativeElement.submit();
    console.log('saving form: ', form);
    /*return this.http.post<SaveReponse>('/viewer-admin/action/form/save', {'params':'pietje=asdf'},{
      headers:{
        'Content-Type': 'plain/text'
      }
    }).pipe(
      map(resp=>{
        if(!resp.success){
          throw new Error(resp.message);
        }
      }),
      catchError((): Observable<any> => {
        console.log("error saving");
        return of([]);}),
    ).subscribe(v=>{sdf
      const a=  0;
      console.log(v);
    });*/
  }
}
