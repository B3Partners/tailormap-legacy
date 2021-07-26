import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {FormEditorModule, SharedModule} from "@tailormap/admin-config";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    DragDropModule,
    BrowserAnimationsModule,
    SharedModule,
    FormEditorModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
