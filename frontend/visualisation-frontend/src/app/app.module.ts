import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './modules/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UploadComponent } from './pages/upload/upload.component';
import { VisualisationComponent } from './pages/visualisation/visualisation.component';
import { BarComponent } from './pages/visualisation/bar/bar.component';
import { ChartsModule } from 'ng2-charts';
import { PieComponent } from './pages/visualisation/pie/pie.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { PieGridComponent } from './pages/visualisation/pie-grid/pie-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    VisualisationComponent,
    BarComponent,
    PieComponent,
    PieGridComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule,
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
