import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarComponent } from './components/visualisations/bar/bar.component';
import { TreeMapComponent } from './components/visualisations/tree-map/tree-map.component';
import { DetailComponent } from './pages/detail/detail.component';
import { StatisticsComponent } from './pages/statistics/statistics';
import { UploadComponent } from './pages/upload/upload.component';
import { PieGridComponent } from './pages/visualisation/pie-grid/pie-grid.component';
import { VisualisationComponent } from './pages/visualisation/visualisation.component';

const routes: Routes = [
  { path: '', component: UploadComponent },
  { path: 'stats', component: StatisticsComponent },
  { path: 'vis', component: VisualisationComponent,
    children: [
      { path: '', redirectTo: 'pie', pathMatch: 'full' },
      { path: 'pie', component: PieGridComponent },
      { path: 'tree', component: TreeMapComponent },
      { path: 'bar', component: BarComponent },
    ]
  },
  { path: 'detail', component: DetailComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
