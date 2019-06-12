import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './pages/upload/upload.component';
import { VisualisationComponent } from './pages/visualisation/visualisation.component';
import { DatasetOverviewComponent } from './pages/dataset-overview/dataset-overview.component';

const routes: Routes = [
  { path: '', component: UploadComponent },
  { path: 'overview', component: DatasetOverviewComponent },
  { path: 'vis', component: VisualisationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
