import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule } from 'ng2-charts';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ErrorComponent } from './components/error/error.component';
import { MiniSorterComponent } from './components/controls/filters/mini-sorter/mini-sorter.component';
import { SearchFilterComponent } from './components/controls/filters/search-filter/search-filter.component';
import { SortFilterComponent } from './components/controls/filters/sort-filter/sort-filter.component';
import { CommentTableComponent } from './components/tables/comment-table/comment-table.component';
import { SentimentTableComponent } from './components/tables/sentiment-table/sentiment-table.component';
import { BarComponent } from './components/visualisations/bar/bar.component';
import { PieCellComponent } from './components/visualisations/pie-cell/pie-cell.component';
import { PieComponent } from './components/visualisations/pie/pie.component';
import { TreeMapComponent } from './components/visualisations/tree-map/tree-map.component';
import { MaterialModule } from './modules/material.module';
import { DetailComponent } from './pages/detail/detail.component';
import { PieDetailComponent } from './pages/detail/pie-detail/pie-detail.component';
import { StatisticsComponent } from './pages/statistics/statistics';
import { UploadComponent } from './pages/upload/upload.component';
import { CompareComponent } from './pages/visualisation/compare/compare.component';
import { VisualisationComponent } from './pages/visualisation/visualisation.component';
import { MergedMembersTableComponent } from './components/tables/merged-members-table/merged-members-table.component';
import { BubbleComponent } from './components/visualisations/bubble/bubble.component';
import { ExploreComponent } from './pages/visualisation/explore/explore.component';
import { SizeScalingComponent } from './components/controls/size-scaling/size-scaling.component';
import { LayoutComponent } from './components/controls/layout/layout.component';
import { HttpClientModule } from '@angular/common/http';
import { CommentsComponent } from './components/visualisations/comments/comments.component';
import { ActiveFiltersComponent } from './components/controls/active-filters/active-filters.component';
import { InspectComponent } from './pages/visualisation/inspect/inspect.component';
import { FilterComponent } from './components/controls/filters/filter/filter.component';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    VisualisationComponent,
    BarComponent,
    PieComponent,
    CompareComponent,
    StatisticsComponent,
    TreeMapComponent,
    DetailComponent,
    ErrorComponent,
    PieCellComponent,
    PieDetailComponent,
    SentimentTableComponent,
    CommentTableComponent,
    BreadcrumbComponent,
    SortFilterComponent,
    MiniSorterComponent,
    SearchFilterComponent,
    MergedMembersTableComponent,
    BubbleComponent,
    ExploreComponent,
    SizeScalingComponent,
    LayoutComponent,
    CommentsComponent,
    ActiveFiltersComponent,
    InspectComponent,
    FilterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
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
