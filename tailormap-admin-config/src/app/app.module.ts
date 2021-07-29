import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {ConfigpageModule} from "@tailormap/admin-config";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {CommonModule} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    DragDropModule,
    BrowserAnimationsModule,

    MatIconModule,
    ConfigpageModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
