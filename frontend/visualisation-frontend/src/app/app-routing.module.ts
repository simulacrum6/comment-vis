import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarComponent } from './components/visualisations/bar/bar.component';
import { TreeMapComponent } from './components/visualisations/tree-map/tree-map.component';
import { DetailComponent } from './pages/detail/detail.component';
import { StatisticsComponent } from './pages/statistics/statistics';
import { UploadComponent } from './pages/upload/upload.component';
import { CompareComponent } from './pages/visualisation/compare/compare.component';
import { VisualisationComponent } from './pages/visualisation/visualisation.component';
import { BubbleComponent } from './components/visualisations/bubble/bubble.component';
import { ExploreComponent } from './pages/visualisation/explore/explore.component';
import { CommentsComponent } from './components/visualisations/comments/comments.component';
import { InspectComponent } from './pages/visualisation/inspect/inspect.component';
import {UploadFormatComponent} from './pages/upload-format/upload-format.component';

const routes: Routes = [
  { path: '', component: UploadComponent },
  { path: 'format', component: UploadFormatComponent },
  { path: 'stats', component: StatisticsComponent },
  { path: 'vis', component: VisualisationComponent,
    children: [
      { path: '', redirectTo: 'explore', pathMatch: 'full' },
      { path: 'explore', component: ExploreComponent },
      { path: 'pie', redirectTo: 'compare', pathMatch: 'full' },
      { path: 'embeddings', redirectTo: 'explore', pathMatch: 'full' },
      { path: 'compare', component: CompareComponent },
      { path: 'tree', component: TreeMapComponent },
      { path: 'bar', component: BarComponent },
      { path: 'inspect', component: InspectComponent },
      { path: 'comments', redirectTo: 'inspect' },
      { path: '**', redirectTo: 'compare' },
    ]
  },
  { path: 'detail', component: DetailComponent },
  { path: '**', component: UploadComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
