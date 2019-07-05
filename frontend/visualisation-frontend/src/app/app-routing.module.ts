import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './pages/upload/upload.component';
import { VisualisationComponent } from './pages/visualisation/visualisation.component';
import { DatasetOverviewComponent } from './pages/dataset-overview/dataset-overview.component';
import { PieGridComponent } from './pages/visualisation/pie-grid/pie-grid.component';
import { TreeMapComponent } from './pages/visualisation/tree-map/tree-map.component';
import { BarComponent } from './pages/visualisation/bar/bar.component';

const routes: Routes = [
  { path: '', component: UploadComponent },
  { path: 'overview', component: DatasetOverviewComponent },
  { path: 'vis', component: VisualisationComponent,
    children: [
      { path: '', redirectTo: 'pie', pathMatch: 'full' },
      { path: 'pie', component: PieGridComponent },
      { path: 'tree', component: TreeMapComponent },
      { path: 'bar', component: BarComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
