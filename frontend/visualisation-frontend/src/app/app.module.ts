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
import { FlexLayoutModule } from '@angular/flex-layout';
import { PieGridComponent } from './pages/visualisation/pie-grid/pie-grid.component';
import { DatasetOverviewComponent } from './pages/dataset-overview/dataset-overview.component';
import { TreeMapComponent } from './pages/visualisation/tree-map/tree-map.component';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { DetailComponent } from './pages/detail/detail.component';
import { ErrorComponent } from './pages/error/error.component';
import { PieCellComponent } from './pages/visualisation/pie-cell/pie-cell.component';
import { PieDetailComponent } from './pages/detail/pie-detail/pie-detail.component';
import { SentimentTableComponent } from './pages/detail/sentiment-table/sentiment-table.component';
import { CommentTableComponent } from './pages/detail/comment-table/comment-table.component';
import { BreadcrumbComponent } from './pages/breadcrumb/breadcrumb.component';
import { SortFilterComponent } from './pages/visualisation/sort-filter/sort-filter.component';
import { MiniSorterComponent } from './pages/visualisation/sort-filter/mini-sorter/mini-sorter.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    VisualisationComponent,
    BarComponent,
    PieComponent,
    PieGridComponent,
    DatasetOverviewComponent,
    TreeMapComponent,
    DetailComponent,
    ErrorComponent,
    PieCellComponent,
    PieDetailComponent,
    SentimentTableComponent,
    CommentTableComponent,
    BreadcrumbComponent,
    SortFilterComponent,
    MiniSorterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule,
    ChartsModule,
    Ng2GoogleChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
